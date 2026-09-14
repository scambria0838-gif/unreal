// Copyright NinjaTech AI. All Rights Reserved.
#pragma once

#include "CoreMinimal.h"
#include "Subsystems/EngineSubsystem.h"
#include "SuperNinjaTypes.h"
#include "Interfaces/IHttpRequest.h"
#include "SuperNinjaSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSuperNinjaLog,      const FString&, Message);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSuperNinjaStatus,   const FSuperNinjaAgentStatus&, Status);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSuperNinjaComplete, const FSuperNinjaBuildResult&, Result);

/**
 * USuperNinjaSubsystem
 *
 * Engine-level subsystem that coordinates the Meta-Studio Agent (MSA).
 * Accessible from anywhere (C++, Blueprints, Python) via:
 *   GEngine->GetEngineSubsystem<USuperNinjaSubsystem>()
 */
UCLASS(BlueprintType)
class SUPERNINJAAI_API USuperNinjaSubsystem : public UEngineSubsystem
{
	GENERATED_BODY()

public:
	// UEngineSubsystem
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	/** Fire-and-forget: send a natural-language prompt to the MSA and let it build. */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja",
		meta = (DisplayName = "Build From Prompt",
		        ToolTip = "Send a natural-language prompt to the Meta-Studio Agent. Example: 'Build a scary game on the moon'"))
	void BuildFromPrompt(const FString& Prompt);

	/** Cancel the currently-running build. */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja")
	void CancelCurrentBuild();

	/** Get the latest status snapshot. */
	UFUNCTION(BlueprintCallable, BlueprintPure, Category = "SuperNinja")
	FSuperNinjaAgentStatus GetCurrentStatus() const { return CurrentStatus; }

	/** Update plugin settings at runtime. */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja")
	void UpdateSettings(const FSuperNinjaSettings& NewSettings) { Settings = NewSettings; }

	UFUNCTION(BlueprintCallable, BlueprintPure, Category = "SuperNinja")
	FSuperNinjaSettings GetSettings() const { return Settings; }

	/** Execute a single tool call on the MSA (advanced). */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja|Advanced")
	void ExecuteTool(const FString& ToolName, const FString& ArgsJson);

	/** Events. Bind from Blueprints or C++. */
	UPROPERTY(BlueprintAssignable, Category = "SuperNinja|Events")
	FOnSuperNinjaLog OnLog;

	UPROPERTY(BlueprintAssignable, Category = "SuperNinja|Events")
	FOnSuperNinjaStatus OnStatusUpdate;

	UPROPERTY(BlueprintAssignable, Category = "SuperNinja|Events")
	FOnSuperNinjaComplete OnBuildComplete;

private:
	void PostToAgent(const FString& Endpoint, const FString& PayloadJson,
	                 TFunction<void(bool, const FString&)> Callback);

	void HandleBuildResponse(bool bSuccess, const FString& Response);
	void UpdateStatus(ESuperNinjaAgentState NewState, const FString& Task, float Progress, const FString& Message);

	UPROPERTY()
	FSuperNinjaSettings Settings;

	UPROPERTY()
	FSuperNinjaAgentStatus CurrentStatus;

	TSharedPtr<IHttpRequest, ESPMode::ThreadSafe> CurrentRequest;
	FString CurrentPrompt;
};