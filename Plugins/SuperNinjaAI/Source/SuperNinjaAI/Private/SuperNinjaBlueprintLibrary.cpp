// Copyright NinjaTech AI. All Rights Reserved.
#include "SuperNinjaBlueprintLibrary.h"
#include "SuperNinjaSubsystem.h"
#include "SuperNinjaAI.h"
#include "Engine/Engine.h"

static USuperNinjaSubsystem* GetSub()
{
	return GEngine ? GEngine->GetEngineSubsystem<USuperNinjaSubsystem>() : nullptr;
}

void USuperNinjaBlueprintLibrary::BuildFromPrompt(const FString& Prompt)
{
	if (USuperNinjaSubsystem* Sub = GetSub())
	{
		Sub->BuildFromPrompt(Prompt);
	}
	else
	{
		UE_LOG(LogSuperNinja, Error, TEXT("SuperNinjaSubsystem not available."));
	}
}

FSuperNinjaAgentStatus USuperNinjaBlueprintLibrary::GetCurrentStatus()
{
	if (USuperNinjaSubsystem* Sub = GetSub()) return Sub->GetCurrentStatus();
	return FSuperNinjaAgentStatus{};
}

void USuperNinjaBlueprintLibrary::BuildLevelFromTemplate(const FString& TemplateName, const FString& CustomDescription)
{
	const FString Prompt = FString::Printf(
		TEXT("Build a %s level. %s"), *TemplateName, *CustomDescription);
	BuildFromPrompt(Prompt);
}

void USuperNinjaBlueprintLibrary::CancelBuild()
{
	if (USuperNinjaSubsystem* Sub = GetSub()) Sub->CancelCurrentBuild();
}

void USuperNinjaBlueprintLibrary::ExecuteTool(const FString& ToolName, const FString& ArgsJson)
{
	if (USuperNinjaSubsystem* Sub = GetSub()) Sub->ExecuteTool(ToolName, ArgsJson);
}