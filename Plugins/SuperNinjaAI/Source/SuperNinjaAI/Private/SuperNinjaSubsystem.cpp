// Copyright NinjaTech AI. All Rights Reserved.
#include "SuperNinjaSubsystem.h"
#include "SuperNinjaAI.h"
#include "HttpModule.h"
#include "Interfaces/IHttpResponse.h"
#include "Serialization/JsonSerializer.h"
#include "Serialization/JsonWriter.h"
#include "Dom/JsonObject.h"
#include "Misc/Paths.h"

void USuperNinjaSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	UE_LOG(LogSuperNinja, Log, TEXT("SuperNinjaSubsystem initialized."));

	CurrentStatus.AgentName   = TEXT("MetaStudioAgent");
	CurrentStatus.State       = ESuperNinjaAgentState::Idle;
	CurrentStatus.CurrentTask = TEXT("Ready");
	CurrentStatus.Progress    = 0.f;
}

void USuperNinjaSubsystem::Deinitialize()
{
	if (CurrentRequest.IsValid())
	{
		CurrentRequest->CancelRequest();
		CurrentRequest.Reset();
	}
	Super::Deinitialize();
}

void USuperNinjaSubsystem::BuildFromPrompt(const FString& Prompt)
{
	if (CurrentStatus.State == ESuperNinjaAgentState::Planning ||
	    CurrentStatus.State == ESuperNinjaAgentState::Building)
	{
		UE_LOG(LogSuperNinja, Warning, TEXT("Build already in progress. Call CancelCurrentBuild first."));
		return;
	}

	CurrentPrompt = Prompt;
	UpdateStatus(ESuperNinjaAgentState::Planning, TEXT("Parsing prompt"), 0.05f,
		FString::Printf(TEXT("Received prompt: %s"), *Prompt));

	// Build request payload
	TSharedPtr<FJsonObject> Payload = MakeShared<FJsonObject>();
	Payload->SetStringField(TEXT("prompt"), Prompt);
	Payload->SetStringField(TEXT("mode"),
		Settings.Mode == ESuperNinjaMode::Local  ? TEXT("local")  :
		Settings.Mode == ESuperNinjaMode::Cloud  ? TEXT("cloud")  :
		                                          TEXT("hybrid"));
	Payload->SetBoolField(TEXT("dry_run"), Settings.bDryRun);
	Payload->SetBoolField(TEXT("auto_screenshot"), Settings.bAutoScreenshotValidation);
	Payload->SetNumberField(TEXT("max_iterations"), Settings.MaxIterations);
	Payload->SetStringField(TEXT("project_path"), FPaths::ProjectDir());

	FString PayloadStr;
	TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&PayloadStr);
	FJsonSerializer::Serialize(Payload.ToSharedRef(), Writer);

	PostToAgent(Settings.ApiEndpoint / TEXT("build"), PayloadStr,
		[this](bool bOk, const FString& Resp) { HandleBuildResponse(bOk, Resp); });
}

void USuperNinjaSubsystem::CancelCurrentBuild()
{
	if (CurrentRequest.IsValid())
	{
		CurrentRequest->CancelRequest();
		CurrentRequest.Reset();
	}
	UpdateStatus(ESuperNinjaAgentState::Idle, TEXT("Cancelled"), 0.f, TEXT("Build cancelled by user."));
}

void USuperNinjaSubsystem::ExecuteTool(const FString& ToolName, const FString& ArgsJson)
{
	TSharedPtr<FJsonObject> Payload = MakeShared<FJsonObject>();
	Payload->SetStringField(TEXT("tool"), ToolName);
	Payload->SetStringField(TEXT("args"), ArgsJson);

	FString PayloadStr;
	TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&PayloadStr);
	FJsonSerializer::Serialize(Payload.ToSharedRef(), Writer);

	PostToAgent(Settings.ApiEndpoint / TEXT("tool"), PayloadStr,
		[this, ToolName](bool bOk, const FString& Resp)
		{
			UE_LOG(LogSuperNinja, Log, TEXT("Tool '%s' returned: %s"),
				*ToolName, *Resp.Left(512));
			OnLog.Broadcast(FString::Printf(TEXT("[Tool:%s] %s"), *ToolName, *Resp.Left(256)));
		});
}

void USuperNinjaSubsystem::PostToAgent(const FString& Endpoint, const FString& PayloadJson,
                                       TFunction<void(bool, const FString&)> Callback)
{
	TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Req = FHttpModule::Get().CreateRequest();
	Req->SetVerb(TEXT("POST"));
	Req->SetURL(Endpoint);
	Req->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
	if (!Settings.ApiKey.IsEmpty())
	{
		Req->SetHeader(TEXT("Authorization"),
			FString::Printf(TEXT("Bearer %s"), *Settings.ApiKey));
	}
	Req->SetContentAsString(PayloadJson);
	Req->SetTimeout(600.f);

	Req->OnProcessRequestComplete().BindLambda(
		[Callback](FHttpRequestPtr Request, FHttpResponsePtr Response, bool bSucceeded)
		{
			if (bSucceeded && Response.IsValid() && Response->GetResponseCode() == 200)
			{
				Callback(true, Response->GetContentAsString());
			}
			else
			{
				const FString Err = Response.IsValid()
					? FString::Printf(TEXT("HTTP %d: %s"),
						Response->GetResponseCode(), *Response->GetContentAsString())
					: TEXT("Request failed (no response)");
				Callback(false, Err);
			}
		});

	CurrentRequest = Req;
	Req->ProcessRequest();
}

void USuperNinjaSubsystem::HandleBuildResponse(bool bSuccess, const FString& Response)
{
	FSuperNinjaBuildResult Result;
	Result.bSuccess        = bSuccess;
	Result.RawResponseJson = Response;

	if (!bSuccess)
	{
		Result.Summary = FString::Printf(TEXT("Build failed: %s"), *Response);
		UpdateStatus(ESuperNinjaAgentState::Error, TEXT("Error"), 0.f, Result.Summary);
		OnBuildComplete.Broadcast(Result);
		return;
	}

	// Parse response JSON
	TSharedPtr<FJsonObject> Json;
	TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Response);
	if (FJsonSerializer::Deserialize(Reader, Json) && Json.IsValid())
	{
		Result.Summary = Json->GetStringField(TEXT("summary"));

		const TArray<TSharedPtr<FJsonValue>>* Assets = nullptr;
		if (Json->TryGetArrayField(TEXT("created_assets"), Assets))
		{
			for (const auto& V : *Assets) Result.CreatedAssets.Add(V->AsString());
		}

		const TArray<TSharedPtr<FJsonValue>>* Levels = nullptr;
		if (Json->TryGetArrayField(TEXT("modified_levels"), Levels))
		{
			for (const auto& V : *Levels) Result.ModifiedLevels.Add(V->AsString());
		}
	}

	UpdateStatus(ESuperNinjaAgentState::Complete, TEXT("Done"), 1.f,
		FString::Printf(TEXT("Built %d assets across %d levels."),
			Result.CreatedAssets.Num(), Result.ModifiedLevels.Num()));

	OnBuildComplete.Broadcast(Result);
}

void USuperNinjaSubsystem::UpdateStatus(ESuperNinjaAgentState NewState, const FString& Task,
                                        float Progress, const FString& Message)
{
	CurrentStatus.State       = NewState;
	CurrentStatus.CurrentTask = Task;
	CurrentStatus.Progress    = Progress;
	CurrentStatus.LastMessage = Message;

	UE_LOG(LogSuperNinja, Log, TEXT("[%s] %s — %s (%.0f%%)"),
		*UEnum::GetValueAsString(NewState), *Task, *Message, Progress * 100.f);

	OnStatusUpdate.Broadcast(CurrentStatus);
	OnLog.Broadcast(Message);
}