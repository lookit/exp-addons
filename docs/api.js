YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ExpExitSurvey",
        "ExpExitSurveyPilot",
        "ExpFrameBase",
        "ExpFrameBaseUnsafe",
        "ExpLookitDialoguePage",
        "ExpLookitExitSurvey",
        "ExpLookitGeometryAlternation",
        "ExpLookitInstructions",
        "ExpLookitMoodQuestionnaire",
        "ExpLookitPreferentialLooking",
        "ExpLookitPreviewExplanation",
        "ExpLookitStoryPage",
        "ExpLookitText",
        "ExpMoodQuestionnaire",
        "ExpPhysicsIntro",
        "ExpPhysicsPreVideo",
        "ExpPhysicsPreviewExplanation",
        "ExpPlayer",
        "ExpVideoConfig",
        "ExpVideoConfigQuality",
        "ExpVideoConsent",
        "ExpVideoPhysics",
        "ExpVideoPreview",
        "FullScreen",
        "MediaReload",
        "VideoRecordMixin",
        "VideoRecorderObject",
        "geometry",
        "randomParameterSet",
        "videoRecorder"
    ],
    "modules": [
        "components",
        "exp-player",
        "frames",
        "mixins",
        "randomizers",
        "services"
    ],
    "allModules": [
        {
            "displayName": "components",
            "name": "components",
            "description": "Reusable components for UI rendering and interactivity"
        },
        {
            "displayName": "exp-player",
            "name": "exp-player",
            "description": "Reusable parts of experiments. Includes frame definitions, randomizers, and utilities."
        },
        {
            "displayName": "frames",
            "name": "frames",
            "description": "Reusable frames that can be used as part of user-defined experiments. This is the main reference for researchers\n  looking to build their own experiment definitions on the experimenter platform."
        },
        {
            "displayName": "mixins",
            "name": "mixins",
            "description": "Mixins that can be used to add functionality, eg to a specific frame"
        },
        {
            "displayName": "randomizers",
            "name": "randomizers",
            "description": "Reusable randomizers that can be used as part of user-defined experiments.\nRandomizers allow researchers to specify how to select which frames or\nsequences of frames to use as part of a particular session of a given\nexperiment, for instance in order to counterbalance stimuli used across\nsubjects, assign subjects randomly to different experimental conditions, or\nimplement a longitudinal design where the frames used in this study depend on\nthe frames used in the participant's last session."
        },
        {
            "displayName": "services",
            "name": "services",
            "description": "Services used to share data or provide centralized functionality"
        }
    ],
    "elements": []
} };
});