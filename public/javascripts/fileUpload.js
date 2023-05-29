FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
)

FilePond.setOptions({
    stylePanelAspectRatio : 1.5,
    ImageResizeTargetWidth : 150,
    ImageResizeTargetHeight : 100
})

FilePond.parse(document.body);