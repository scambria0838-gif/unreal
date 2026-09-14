// Copyright NinjaTech AI. All Rights Reserved.
#pragma once

#include "CoreMinimal.h"
#include "SuperNinjaTypes.generated.h"

UENUM(BlueprintType)
enum class ESuperNinjaMode : uint8
{
	Local      UMETA(DisplayName = "Local (Sovereign)"),
	Cloud      UMETA(DisplayName = "Cloud (NinjaTech API)"),
	Hybrid     UMETA(DisplayName = "Hybrid")
};

UENUM(BlueprintType)
enum class ESuperNinjaAgentState : uint8
{
	Idle       UMETA(DisplayName = "Idle"),
	Planning   UMETA(DisplayName = "Planning"),
	Building   UMETA(DisplayName = "Building"),
	Validating UMETA(DisplayName = "Validating"),
	Complete   UMETA(DisplayName = "Complete"),
	Error      UMETA(DisplayName = "Error")
};

USTRUCT(BlueprintType)
struct SUPERNINJAAI_API FSuperNinjaAgentStatus
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	FString AgentName;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	ESuperNinjaAgentState State = ESuperNinjaAgentState::Idle;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	FString CurrentTask;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	float Progress = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	FString LastMessage;
};

USTRUCT(BlueprintType)
struct SUPERNINJAAI_API FSuperNinjaBuildResult
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	bool bSuccess = false;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	FString Summary;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	TArray<FString> CreatedAssets;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	TArray<FString> ModifiedLevels;

	UPROPERTY(BlueprintReadOnly, Category = "SuperNinja")
	FString RawResponseJson;
};

USTRUCT(BlueprintType)
struct SUPERNINJAAI_API FSuperNinjaSettings
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "SuperNinja")
	ESuperNinjaMode Mode = ESuperNinjaMode::Cloud;

	UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "SuperNinja")
	FString ApiEndpoint = TEXT("https://api.ninjatech.ai/v1/msa");

	UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "SuperNinja")
	FString ApiKey;

	UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "SuperNinja")
	bool bAutoScreenshotValidation = true;

	UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "SuperNinja")
	int32 MaxIterations = 5;

	UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "SuperNinja")
	bool bDryRun = false;
};