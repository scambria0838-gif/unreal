// Copyright NinjaTech AI. All Rights Reserved.
#include "SuperNinjaAIEditor.h"
#include "SSuperNinjaBuilderPanel.h"
#include "SuperNinjaAI.h"
#include "SuperNinjaSubsystem.h"

#include "ToolMenus.h"
#include "LevelEditor.h"
#include "Framework/Docking/TabManager.h"
#include "Framework/MultiBox/MultiBoxBuilder.h"
#include "Widgets/Docking/SDockTab.h"
#include "WorkspaceMenuStructure.h"
#include "WorkspaceMenuStructureModule.h"
#include "Interfaces/IPluginManager.h"
#include "Styling/SlateStyleRegistry.h"
#include "Styling/SlateStyle.h"
#include "Brushes/SlateImageBrush.h"
#include "Misc/Paths.h"

#define LOCTEXT_NAMESPACE "SuperNinjaAIEditor"

const FName FSuperNinjaAIEditorModule::BuilderTabName(TEXT("SuperNinjaBuilder"));

// -----------------------------------------------------------------------------
// Commands
// -----------------------------------------------------------------------------
FSuperNinjaCommands::FSuperNinjaCommands()
	: TCommands<FSuperNinjaCommands>(
		TEXT("SuperNinjaAI"),
		LOCTEXT("SuperNinjaAI", "SuperNinja AI"),
		NAME_None,
		TEXT("SuperNinjaStyle"))
{
}

void FSuperNinjaCommands::RegisterCommands()
{
	UI_COMMAND(OpenBuilderTab, "SuperNinja Builder",
		"Open the SuperNinja AI Builder panel",
		EUserInterfaceActionType::Button, FInputChord());

	UI_COMMAND(QuickBuild, "Quick Build",
		"Quickly build something from a prompt",
		EUserInterfaceActionType::Button, FInputChord(EKeys::N, EModifierKey::Control | EModifierKey::Shift));

	UI_COMMAND(OpenSettings, "Settings",
		"Configure SuperNinja AI",
		EUserInterfaceActionType::Button, FInputChord());
}

// -----------------------------------------------------------------------------
// Module
// -----------------------------------------------------------------------------
void FSuperNinjaAIEditorModule::StartupModule()
{
	UE_LOG(LogSuperNinja, Log, TEXT("SuperNinjaAI Editor module starting."));

	RegisterStyle();
	FSuperNinjaCommands::Register();

	PluginCommands = MakeShareable(new FUICommandList);
	PluginCommands->MapAction(FSuperNinjaCommands::Get().OpenBuilderTab,
		FExecuteAction::CreateRaw(this, &FSuperNinjaAIEditorModule::OnOpenBuilderTab),
		FCanExecuteAction());
	PluginCommands->MapAction(FSuperNinjaCommands::Get().QuickBuild,
		FExecuteAction::CreateRaw(this, &FSuperNinjaAIEditorModule::OnQuickBuild),
		FCanExecuteAction());
	PluginCommands->MapAction(FSuperNinjaCommands::Get().OpenSettings,
		FExecuteAction::CreateRaw(this, &FSuperNinjaAIEditorModule::OnOpenSettings),
		FCanExecuteAction());

	UToolMenus::RegisterStartupCallback(
		FSimpleMulticastDelegate::FDelegate::CreateRaw(this, &FSuperNinjaAIEditorModule::RegisterMenus));

	FGlobalTabmanager::Get()
		->RegisterNomadTabSpawner(BuilderTabName,
			FOnSpawnTab::CreateRaw(this, &FSuperNinjaAIEditorModule::OnSpawnBuilderTab))
		.SetDisplayName(LOCTEXT("BuilderTabTitle", "SuperNinja Builder"))
		.SetTooltipText(LOCTEXT("BuilderTabTooltip", "AI-powered game builder"))
		.SetGroup(WorkspaceMenu::GetMenuStructure().GetToolsCategory())
		.SetIcon(FSlateIcon(TEXT("SuperNinjaStyle"), TEXT("SuperNinja.TabIcon")));
}

void FSuperNinjaAIEditorModule::ShutdownModule()
{
	UToolMenus::UnRegisterStartupCallback(this);
	UToolMenus::UnregisterOwner(this);

	FGlobalTabmanager::Get()->UnregisterNomadTabSpawner(BuilderTabName);
	FSuperNinjaCommands::Unregister();
	UnregisterStyle();
}

void FSuperNinjaAIEditorModule::RegisterMenus()
{
	FToolMenuOwnerScoped OwnerScoped(this);

	// Main menu → Tools → SuperNinja AI
	{
		UToolMenu* Menu = UToolMenus::Get()->ExtendMenu("LevelEditor.MainMenu.Tools");
		FToolMenuSection& Section = Menu->FindOrAddSection("SuperNinja");
		Section.Label = LOCTEXT("SuperNinjaSection", "SuperNinja AI");
		Section.AddMenuEntryWithCommandList(FSuperNinjaCommands::Get().OpenBuilderTab, PluginCommands);
		Section.AddMenuEntryWithCommandList(FSuperNinjaCommands::Get().QuickBuild, PluginCommands);
		Section.AddMenuEntryWithCommandList(FSuperNinjaCommands::Get().OpenSettings, PluginCommands);
	}

	// Toolbar button on Level Editor
	{
		UToolMenu* Toolbar = UToolMenus::Get()->ExtendMenu("LevelEditor.LevelEditorToolBar.PlayToolBar");
		FToolMenuSection& Section = Toolbar->FindOrAddSection("SuperNinja");
		FToolMenuEntry Entry = FToolMenuEntry::InitToolBarButton(
			FSuperNinjaCommands::Get().OpenBuilderTab,
			LOCTEXT("SuperNinjaToolbar", "SuperNinja"),
			LOCTEXT("SuperNinjaTooltip", "Open SuperNinja AI Builder"),
			FSlateIcon(TEXT("SuperNinjaStyle"), TEXT("SuperNinja.ToolbarIcon")));
		Entry.StyleNameOverride = "CalloutToolbar";
		Section.AddEntry(Entry);
	}
}

TSharedRef<SDockTab> FSuperNinjaAIEditorModule::OnSpawnBuilderTab(const FSpawnTabArgs& Args)
{
	return SNew(SDockTab)
		.TabRole(ETabRole::NomadTab)
		.Label(LOCTEXT("SuperNinjaBuilderTitle", "🥷 SuperNinja AI Builder"))
		[
			SNew(SSuperNinjaBuilderPanel)
		];
}

void FSuperNinjaAIEditorModule::OnOpenBuilderTab()
{
	FGlobalTabmanager::Get()->TryInvokeTab(BuilderTabName);
}

void FSuperNinjaAIEditorModule::OnQuickBuild()
{
	OnOpenBuilderTab(); // Panel focuses the input field on open
}

void FSuperNinjaAIEditorModule::OnOpenSettings()
{
	// TODO: Open project settings → SuperNinja section
	OnOpenBuilderTab();
}

// -----------------------------------------------------------------------------
// Style
// -----------------------------------------------------------------------------
void FSuperNinjaAIEditorModule::RegisterStyle()
{
	StyleSet = MakeShareable(new FSlateStyleSet("SuperNinjaStyle"));

	const FString PluginDir = IPluginManager::Get().FindPlugin(TEXT("SuperNinjaAI"))->GetBaseDir();
	StyleSet->SetContentRoot(PluginDir / TEXT("Resources"));

	const FVector2D Icon16(16.f, 16.f);
	const FVector2D Icon40(40.f, 40.f);
	const FVector2D Icon64(64.f, 64.f);

	StyleSet->Set("SuperNinja.TabIcon",
		new FSlateImageBrush(StyleSet->RootToContentDir(TEXT("Icon128.png")), Icon16));
	StyleSet->Set("SuperNinja.ToolbarIcon",
		new FSlateImageBrush(StyleSet->RootToContentDir(TEXT("Icon128.png")), Icon40));
	StyleSet->Set("SuperNinja.LargeIcon",
		new FSlateImageBrush(StyleSet->RootToContentDir(TEXT("Icon128.png")), Icon64));

	FSlateStyleRegistry::RegisterSlateStyle(*StyleSet);
}

void FSuperNinjaAIEditorModule::UnregisterStyle()
{
	if (StyleSet.IsValid())
	{
		FSlateStyleRegistry::UnRegisterSlateStyle(*StyleSet);
		StyleSet.Reset();
	}
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_MODULE(FSuperNinjaAIEditorModule, SuperNinjaAIEditor)