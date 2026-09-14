// Copyright NinjaTech AI. All Rights Reserved.
#pragma once

#include "CoreMinimal.h"
#include "Widgets/SCompoundWidget.h"
#include "SuperNinjaTypes.h"

class SMultiLineEditableTextBox;
class SScrollBox;
class STextBlock;
class SProgressBar;
class SEditableTextBox;
class SComboBox;

/**
 * SSuperNinjaBuilderPanel
 *
 * The main editor panel. Four sections:
 *   1. Prompt input (multi-line) + template chooser + Build button
 *   2. Live status bar with progress
 *   3. Scrollable log output
 *   4. Results & created-assets list
 */
class SUPERNINJAAIEDITOR_API SSuperNinjaBuilderPanel : public SCompoundWidget
{
public:
	SLATE_BEGIN_ARGS(SSuperNinjaBuilderPanel) {}
	SLATE_END_ARGS()

	void Construct(const FArguments& InArgs);
	virtual ~SSuperNinjaBuilderPanel();

private:
	// Handlers
	FReply OnBuildClicked();
	FReply OnCancelClicked();
	FReply OnClearLogClicked();
	FReply OnTemplateClicked(FString TemplateName, FString TemplatePrompt);
	void   OnStatusUpdated(const FSuperNinjaAgentStatus& Status);
	void   OnLogReceived(const FString& Message);
	void   OnBuildCompleted(const FSuperNinjaBuildResult& Result);

	// UI helpers
	TSharedRef<SWidget> BuildHeader();
	TSharedRef<SWidget> BuildPromptSection();
	TSharedRef<SWidget> BuildTemplateChips();
	TSharedRef<SWidget> BuildStatusSection();
	TSharedRef<SWidget> BuildLogSection();
	TSharedRef<SWidget> BuildResultsSection();

	void AppendLog(const FString& Line, const FLinearColor& Color = FLinearColor::White);
	FText GetStatusText() const;
	TOptional<float> GetProgress() const;

	// Widgets
	TSharedPtr<SMultiLineEditableTextBox> PromptBox;
	TSharedPtr<SScrollBox>                LogScrollBox;
	TSharedPtr<STextBlock>                StatusLabel;
	TSharedPtr<SProgressBar>              ProgressBar;
	TSharedPtr<SScrollBox>                ResultsList;

	// State
	FSuperNinjaAgentStatus CachedStatus;
	bool bIsBuilding = false;

	// Delegate handles (for cleanup)
	FDelegateHandle LogHandle;
	FDelegateHandle StatusHandle;
	FDelegateHandle CompleteHandle;
};