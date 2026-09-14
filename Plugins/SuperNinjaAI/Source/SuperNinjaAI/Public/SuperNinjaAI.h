// Copyright NinjaTech AI. All Rights Reserved.
#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

DECLARE_LOG_CATEGORY_EXTERN(LogSuperNinja, Log, All);

class FSuperNinjaAIModule : public IModuleInterface
{
public:
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;

	static inline FSuperNinjaAIModule& Get()
	{
		return FModuleManager::LoadModuleChecked<FSuperNinjaAIModule>("SuperNinjaAI");
	}

	static inline bool IsAvailable()
	{
		return FModuleManager::Get().IsModuleLoaded("SuperNinjaAI");
	}
};