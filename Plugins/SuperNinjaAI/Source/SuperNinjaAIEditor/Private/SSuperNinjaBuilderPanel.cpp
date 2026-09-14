// Copyright NinjaTech AI. All Rights Reserved.
#include "SSuperNinjaBuilderPanel.h"
#include "SuperNinjaSubsystem.h"
#include "SuperNinjaAI.h"

#include "Widgets/Input/SButton.h"
#include "Widgets/Input/SMultiLineEditableTextBox.h"
#include "Widgets/Input/SEditableTextBox.h"
#include "Widgets/Layout/SScrollBox.h"
#include "Widgets/Layout/SBorder.h"
#include "Widgets/Layout/SSeparator.h"
#include "Widgets/Layout/SWrapBox.h"
#include "Widgets/Notifications/SProgressBar.h"
#include "Widgets/Text/STextBlock.h"
#include "Widgets/Text/SRichTextBlock.h"
#include "Widgets/Images/SImage.h"
#include "Widgets/SBoxPanel.h"
#include "Styling/AppStyle.h"
#include "Engine/Engine.h"

#define LOCTEXT_NAMESPACE "SuperNinjaBuilder"

namespace SNJStyle
{
	static const FLinearColor NinjaPurple (0.55f, 0.35f, 0.90f, 1.0f);
	static const FLinearColor NinjaAccent (0.95f, 0.55f, 0.20f, 1.0f);
	static const FLinearColor BgPanel     (0.05f, 0.05f, 0.08f, 1.0f);
	static const FLinearColor BgInput     (0.10f, 0.10f, 0.14f, 1.0f);
	static const FLinearColor TextDim     (0.70f, 0.70f, 0.72f, 1.0f);
	static const FLinearColor Success     (0.35f, 0.85f, 0.45f, 1.0f);
	static const FLinearColor Warning     (0.95f, 0.75f, 0.25f, 1.0f);
	static const FLinearColor Error       (0.95f, 0.35f, 0.35f, 1.0f);
}

// -----------------------------------------------------------------------------
// Construct
// -----------------------------------------------------------------------------
void SSuperNinjaBuilderPanel::Construct(const FArguments& InArgs)
{
	ChildSlot
	[
		SNew(SBorder)
		.BorderImage(FAppStyle::GetBrush("ToolPanel.GroupBorder"))
		.Padding(12)
		[
			SNew(SVerticalBox)

			+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 10)
			[ BuildHeader() ]

			+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 8)
			[ BuildPromptSection() ]

			+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 8)
			[ BuildTemplateChips() ]

			+ SVerticalBox::Slot().AutoHeight().Padding(0, 4, 0, 8)
			[ BuildStatusSection() ]

			+ SVerticalBox::Slot().FillHeight(1.0).Padding(0, 0, 0, 8)
			[ BuildLogSection() ]

			+ SVerticalBox::Slot().AutoHeight().MaxHeight(180).Padding(0)
			[ BuildResultsSection() ]
		]
	];

	// Hook subsystem events
	if (USuperNinjaSubsystem* Sub = GEngine ? GEngine->GetEngineSubsystem<USuperNinjaSubsystem>() : nullptr)
	{
		Sub->OnLog.AddDynamic          (this, &SSuperNinjaBuilderPanel::OnLogReceived);
		Sub->OnStatusUpdate.AddDynamic (this, &SSuperNinjaBuilderPanel::OnStatusUpdated);
		Sub->OnBuildComplete.AddDynamic(this, &SSuperNinjaBuilderPanel::OnBuildCompleted);
		CachedStatus = Sub->GetCurrentStatus();
	}

	AppendLog(TEXT("🥷  SuperNinja AI ready. Type a prompt and press Build."), SNJStyle::NinjaAccent);
}

SSuperNinjaBuilderPanel::~SSuperNinjaBuilderPanel()
{
	if (GEngine)
	{
		if (USuperNinjaSubsystem* Sub = GEngine->GetEngineSubsystem<USuperNinjaSubsystem>())
		{
			Sub->OnLog.RemoveAll(this);
			Sub->OnStatusUpdate.RemoveAll(this);
			Sub->OnBuildComplete.RemoveAll(this);
		}
	}
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------
TSharedRef<SWidget> SSuperNinjaBuilderPanel::BuildHeader()
{
	return SNew(SHorizontalBox)
		+ SHorizontalBox::Slot().AutoWidth().VAlign(VAlign_Center).Padding(0, 0, 10, 0)
		[
			SNew(STextBlock)
			.Text(FText::FromString(TEXT("🥷")))
			.Font(FCoreStyle::GetDefaultFontStyle("Bold", 28))
		]
		+ SHorizontalBox::Slot().AutoWidth().VAlign(VAlign_Center)
		[
			SNew(SVerticalBox)
			+ SVerticalBox::Slot().AutoHeight()
			[
				SNew(STextBlock)
				.Text(LOCTEXT("Title", "SuperNinja AI Builder"))
				.Font(FCoreStyle::GetDefaultFontStyle("Bold", 18))
				.ColorAndOpacity(FSlateColor(SNJStyle::NinjaAccent))
			]
			+ SVerticalBox::Slot().AutoHeight()
			[
				SNew(STextBlock)
				.Text(LOCTEXT("Subtitle", "Build games from natural language. Powered by 13 AI agents."))
				.ColorAndOpacity(FSlateColor(SNJStyle::TextDim))
			]
		]
		+ SHorizontalBox::Slot().FillWidth(1.0)[ SNullWidget::NullWidget ]
		+ SHorizontalBox::Slot().AutoWidth().VAlign(VAlign_Center)
		[
			SNew(STextBlock)
			.Text(LOCTEXT("Badge", "v1.0 · BETA"))
			.ColorAndOpacity(FSlateColor(SNJStyle::NinjaPurple))
		];
}

// -----------------------------------------------------------------------------
// Prompt section
// -----------------------------------------------------------------------------
TSharedRef<SWidget> SSuperNinjaBuilderPanel::BuildPromptSection()
{
	return SNew(SVerticalBox)
		+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 4)
		[
			SNew(STextBlock)
			.Text(LOCTEXT("PromptLabel", "What do you want to build?"))
			.Font(FCoreStyle::GetDefaultFontStyle("Bold", 11))
		]
		+ SVerticalBox::Slot().AutoHeight()
		[
			SNew(SBorder)
			.BorderImage(FAppStyle::GetBrush("ToolPanel.DarkGroupBorder"))
			.Padding(2)
			[
				SAssignNew(PromptBox, SMultiLineEditableTextBox)
				.HintText(LOCTEXT("PromptHint",
					"e.g. 'Build a scary game on the moon with a lone astronaut and alien corpses'"))
				.AutoWrapText(true)
				.AlwaysShowScrollbars(false)
			]
		]
		+ SVerticalBox::Slot().AutoHeight().Padding(0, 8, 0, 0)
		[
			SNew(SHorizontalBox)
			+ SHorizontalBox::Slot().FillWidth(1.0)
			[
				SNew(SButton)
				.HAlign(HAlign_Center)
				.VAlign(VAlign_Center)
				.ContentPadding(FMargin(14, 8))
				.ButtonColorAndOpacity(FSlateColor(SNJStyle::NinjaAccent))
				.OnClicked(this, &SSuperNinjaBuilderPanel::OnBuildClicked)
				[
					SNew(STextBlock)
					.Text(LOCTEXT("BuildButton", "🚀  Build"))
					.Font(FCoreStyle::GetDefaultFontStyle("Bold", 12))
					.ColorAndOpacity(FSlateColor(FLinearColor::White))
				]
			]
			+ SHorizontalBox::Slot().AutoWidth().Padding(6, 0, 0, 0)
			[
				SNew(SButton)
				.ContentPadding(FMargin(14, 8))
				.OnClicked(this, &SSuperNinjaBuilderPanel::OnCancelClicked)
				[ SNew(STextBlock).Text(LOCTEXT("CancelButton", "Cancel")) ]
			]
			+ SHorizontalBox::Slot().AutoWidth().Padding(6, 0, 0, 0)
			[
				SNew(SButton)
				.ContentPadding(FMargin(14, 8))
				.OnClicked(this, &SSuperNinjaBuilderPanel::OnClearLogClicked)
				[ SNew(STextBlock).Text(LOCTEXT("ClearButton", "Clear Log")) ]
			]
		];
}

// -----------------------------------------------------------------------------
// Template chips
// -----------------------------------------------------------------------------
TSharedRef<SWidget> SSuperNinjaBuilderPanel::BuildTemplateChips()
{
	struct FTemplate { FString Label; FString Prompt; };
	static const TArray<FTemplate> Templates = {
		{ TEXT("🌙  Lunar Horror"),   TEXT("Build a scary first-person horror game set on the moon with a lone astronaut exploring a derelict base.") },
		{ TEXT("🏎️  Arcade Racer"),  TEXT("Build a fast-paced arcade racing game with neon-lit streets and 3 playable vehicles.") },
		{ TEXT("⚔️  Fantasy RPG"),    TEXT("Build a medieval fantasy RPG level with a village, quest NPCs, a dungeon, and a boss arena.") },
		{ TEXT("🚔  Police Station"), TEXT("Build a noir detective level inside a police station using the Kitbash3D Police Dept kit. Include the bullpen, interrogation room, and jail cells.") },
		{ TEXT("🌲  Open World"),     TEXT("Build an open-world survival sandbox with procedural terrain, biomes, day/night cycle, and wildlife.") },
		{ TEXT("🏙️  Cyberpunk Alley"), TEXT("Build a rainy cyberpunk alley scene at night with neon signs, reflective puddles, and ambient crowd chatter.") }
	};

	TSharedRef<SWrapBox> Chips = SNew(SWrapBox).UseAllottedSize(true).InnerSlotPadding(FVector2D(6, 6));

	for (const auto& T : Templates)
	{
		const FString Label  = T.Label;
		const FString Prompt = T.Prompt;
		Chips->AddSlot()
		[
			SNew(SButton)
			.ContentPadding(FMargin(10, 4))
			.OnClicked_Lambda([this, Label, Prompt]()
			{
				return OnTemplateClicked(Label, Prompt);
			})
			[ SNew(STextBlock).Text(FText::FromString(Label)) ]
		];
	}

	return SNew(SVerticalBox)
		+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 4)
		[
			SNew(STextBlock)
			.Text(LOCTEXT("TemplatesLabel", "Quick templates:"))
			.ColorAndOpacity(FSlateColor(SNJStyle::TextDim))
		]
		+ SVerticalBox::Slot().AutoHeight()
		[ Chips ];
}

// -----------------------------------------------------------------------------
// Status section
// -----------------------------------------------------------------------------
TSharedRef<SWidget> SSuperNinjaBuilderPanel::BuildStatusSection()
{
	return SNew(SBorder)
		.BorderImage(FAppStyle::GetBrush("ToolPanel.DarkGroupBorder"))
		.Padding(10)
		[
			SNew(SVerticalBox)
			+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 6)
			[
				SNew(SHorizontalBox)
				+ SHorizontalBox::Slot().AutoWidth()
				[
					SNew(STextBlock)
					.Text(LOCTEXT("StatusPrefix", "Status: "))
					.Font(FCoreStyle::GetDefaultFontStyle("Bold", 10))
				]
				+ SHorizontalBox::Slot().FillWidth(1.0)
				[
					SAssignNew(StatusLabel, STextBlock)
					.Text(this, &SSuperNinjaBuilderPanel::GetStatusText)
				]
			]
			+ SVerticalBox::Slot().AutoHeight()
			[
				SAssignNew(ProgressBar, SProgressBar)
				.Percent(this, &SSuperNinjaBuilderPanel::GetProgress)
				.FillColorAndOpacity(FSlateColor(SNJStyle::NinjaAccent))
			]
		];
}

// -----------------------------------------------------------------------------
// Log section
// -----------------------------------------------------------------------------
TSharedRef<SWidget> SSuperNinjaBuilderPanel::BuildLogSection()
{
	return SNew(SBorder)
		.BorderImage(FAppStyle::GetBrush("ToolPanel.DarkGroupBorder"))
		.Padding(6)
		[
			SNew(SVerticalBox)
			+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 4)
			[
				SNew(STextBlock)
				.Text(LOCTEXT("LogLabel", "Agent Log"))
				.Font(FCoreStyle::GetDefaultFontStyle("Bold", 10))
			]
			+ SVerticalBox::Slot().FillHeight(1.0)
			[
				SAssignNew(LogScrollBox, SScrollBox)
				.Orientation(Orient_Vertical)
			]
		];
}

// -----------------------------------------------------------------------------
// Results section
// -----------------------------------------------------------------------------
TSharedRef<SWidget> SSuperNinjaBuilderPanel::BuildResultsSection()
{
	return SNew(SBorder)
		.BorderImage(FAppStyle::GetBrush("ToolPanel.DarkGroupBorder"))
		.Padding(6)
		[
			SNew(SVerticalBox)
			+ SVerticalBox::Slot().AutoHeight().Padding(0, 0, 0, 4)
			[
				SNew(STextBlock)
				.Text(LOCTEXT("ResultsLabel", "Created Assets"))
				.Font(FCoreStyle::GetDefaultFontStyle("Bold", 10))
			]
			+ SVerticalBox::Slot().FillHeight(1.0)
			[
				SAssignNew(ResultsList, SScrollBox)
			]
		];
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------
FReply SSuperNinjaBuilderPanel::OnBuildClicked()
{
	if (!PromptBox.IsValid()) return FReply::Handled();

	const FString Prompt = PromptBox->GetText().ToString().TrimStartAndEnd();
	if (Prompt.IsEmpty())
	{
		AppendLog(TEXT("⚠️  Please enter a prompt first."), SNJStyle::Warning);
		return FReply::Handled();
	}

	bIsBuilding = true;
	AppendLog(FString::Printf(TEXT("▶️  Building: \"%s\""), *Prompt), SNJStyle::NinjaAccent);

	if (USuperNinjaSubsystem* Sub = GEngine->GetEngineSubsystem<USuperNinjaSubsystem>())
	{
		Sub->BuildFromPrompt(Prompt);
	}
	return FReply::Handled();
}

FReply SSuperNinjaBuilderPanel::OnCancelClicked()
{
	if (USuperNinjaSubsystem* Sub = GEngine->GetEngineSubsystem<USuperNinjaSubsystem>())
	{
		Sub->CancelCurrentBuild();
	}
	bIsBuilding = false;
	AppendLog(TEXT("🛑  Build cancelled."), SNJStyle::Warning);
	return FReply::Handled();
}

FReply SSuperNinjaBuilderPanel::OnClearLogClicked()
{
	if (LogScrollBox.IsValid()) LogScrollBox->ClearChildren();
	if (ResultsList.IsValid())  ResultsList->ClearChildren();
	return FReply::Handled();
}

FReply SSuperNinjaBuilderPanel::OnTemplateClicked(FString TemplateName, FString TemplatePrompt)
{
	if (PromptBox.IsValid()) PromptBox->SetText(FText::FromString(TemplatePrompt));
	AppendLog(FString::Printf(TEXT("📋  Loaded template: %s"), *TemplateName), SNJStyle::NinjaPurple);
	return FReply::Handled();
}

void SSuperNinjaBuilderPanel::OnStatusUpdated(const FSuperNinjaAgentStatus& Status)
{
	CachedStatus = Status;
}

void SSuperNinjaBuilderPanel::OnLogReceived(const FString& Message)
{
	AppendLog(Message);
}

void SSuperNinjaBuilderPanel::OnBuildCompleted(const FSuperNinjaBuildResult& Result)
{
	bIsBuilding = false;
	AppendLog(Result.bSuccess
		? FString::Printf(TEXT("✅  Build complete. %s"), *Result.Summary)
		: FString::Printf(TEXT("❌  Build failed. %s"), *Result.Summary),
		Result.bSuccess ? SNJStyle::Success : SNJStyle::Error);

	if (ResultsList.IsValid())
	{
		ResultsList->ClearChildren();
		for (const FString& Asset : Result.CreatedAssets)
		{
			ResultsList->AddSlot().Padding(2)
			[
				SNew(STextBlock)
				.Text(FText::FromString(FString::Printf(TEXT("  • %s"), *Asset)))
				.ColorAndOpacity(FSlateColor(SNJStyle::Success))
			];
		}
		for (const FString& Level : Result.ModifiedLevels)
		{
			ResultsList->AddSlot().Padding(2)
			[
				SNew(STextBlock)
				.Text(FText::FromString(FString::Printf(TEXT("  ↪ Level: %s"), *Level)))
				.ColorAndOpacity(FSlateColor(SNJStyle::NinjaPurple))
			];
		}
	}
}

void SSuperNinjaBuilderPanel::AppendLog(const FString& Line, const FLinearColor& Color)
{
	if (!LogScrollBox.IsValid()) return;
	LogScrollBox->AddSlot().Padding(4, 2)
	[
		SNew(STextBlock)
		.Text(FText::FromString(Line))
		.ColorAndOpacity(FSlateColor(Color))
		.AutoWrapText(true)
	];
	LogScrollBox->ScrollToEnd();
}

FText SSuperNinjaBuilderPanel::GetStatusText() const
{
	return FText::FromString(FString::Printf(TEXT("%s — %s"),
		*UEnum::GetValueAsString(CachedStatus.State).Replace(TEXT("ESuperNinjaAgentState::"), TEXT("")),
		*CachedStatus.CurrentTask));
}

TOptional<float> SSuperNinjaBuilderPanel::GetProgress() const
{
	return CachedStatus.Progress;
}

#undef LOCTEXT_NAMESPACE