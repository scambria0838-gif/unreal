// Copyright NinjaTech AI. All Rights Reserved.
#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"
#include "Framework/Commands/Commands.h"
#include "Styling/SlateStyle.h"

class FUICommandList;
class FToolBarBuilder;
class FMenuBuilder;

/** Editor commands (hotkeys, toolbar buttons, menu entries). */
class FSuperNinjaCommands : public TCommands<FSuperNinjaCommands>
{
public:
	FSuperNinjaCommands();
	virtual void RegisterCommands() override;

	TSharedPtr<FUICommandInfo> OpenBuilderTab;
	TSharedPtr<FUICommandInfo> QuickBuild;
	TSharedPtr<FUICommandInfo> OpenSettings;
};

/** Editor module — sets up the tab, toolbar button, menu, and style. */
class FSuperNinjaAIEditorModule : public IModuleInterface
{
public:
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;

private:
	void RegisterMenus();
	void RegisterStyle();
	void UnregisterStyle();

	TSharedRef<class SDockTab> OnSpawnBuilderTab(const class FSpawnTabArgs& Args);

	void OnOpenBuilderTab();
	void OnQuickBuild();
	void OnOpenSettings();

	TSharedPtr<FUICommandList>  PluginCommands;
	TSharedPtr<FSlateStyleSet>  StyleSet;

	static const FName BuilderTabName;
};