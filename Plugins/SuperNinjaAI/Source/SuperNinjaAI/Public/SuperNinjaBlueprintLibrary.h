// Copyright NinjaTech AI. All Rights Reserved.
#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "SuperNinjaTypes.h"
#include "SuperNinjaBlueprintLibrary.generated.h"

/**
 * Blueprint-friendly static helpers.
 * Use these from the Level Blueprint, Editor Utility widgets, or any UMG.
 */
UCLASS()
class SUPERNINJAAI_API USuperNinjaBlueprintLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	/** One-shot: build a game from a text prompt. */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja",
		meta = (DisplayName = "SuperNinja: Build From Prompt",
		        Keywords = "ai ninja build game prompt"))
	static void BuildFromPrompt(const FString& Prompt);

	/** Get the current status (for binding to UI). */
	UFUNCTION(BlueprintCallable, BlueprintPure, Category = "SuperNinja")
	static FSuperNinjaAgentStatus GetCurrentStatus();

	/** Convenience: Build a specific type of level quickly. */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja|Templates")
	static void BuildLevelFromTemplate(const FString& TemplateName, const FString& CustomDescription);

	/** Cancel any in-flight build. */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja")
	static void CancelBuild();

	/** Execute a single low-level tool call on the MSA. */
	UFUNCTION(BlueprintCallable, Category = "SuperNinja|Advanced")
	static void ExecuteTool(const FString& ToolName, const FString& ArgsJson);
};