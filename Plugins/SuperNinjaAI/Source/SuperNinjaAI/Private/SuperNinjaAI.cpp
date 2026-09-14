// Copyright NinjaTech AI. All Rights Reserved.
#include "SuperNinjaAI.h"

DEFINE_LOG_CATEGORY(LogSuperNinja);

#define LOCTEXT_NAMESPACE "FSuperNinjaAIModule"

void FSuperNinjaAIModule::StartupModule()
{
	UE_LOG(LogSuperNinja, Log, TEXT("SuperNinjaAI runtime module started."));
}

void FSuperNinjaAIModule::ShutdownModule()
{
	UE_LOG(LogSuperNinja, Log, TEXT("SuperNinjaAI runtime module shutdown."));
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_MODULE(FSuperNinjaAIModule, SuperNinjaAI)