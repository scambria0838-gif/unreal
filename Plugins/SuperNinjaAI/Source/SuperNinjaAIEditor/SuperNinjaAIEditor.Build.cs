// Copyright NinjaTech AI. All Rights Reserved.
using UnrealBuildTool;

public class SuperNinjaAIEditor : ModuleRules
{
	public SuperNinjaAIEditor(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"SuperNinjaAI"
		});

		PrivateDependencyModuleNames.AddRange(new string[]
		{
			"Slate",
			"SlateCore",
			"EditorStyle",
			"EditorFramework",
			"UnrealEd",
			"ToolMenus",
			"WorkspaceMenuStructure",
			"InputCore",
			"Projects",
			"LevelEditor",
			"AssetRegistry",
			"AssetTools",
			"PropertyEditor",
			"Kismet",
			"KismetCompiler",
			"BlueprintGraph",
			"PythonScriptPlugin"
		});
	}
}