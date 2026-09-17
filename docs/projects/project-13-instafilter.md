---
title: Project 13 — Instafilter
description: PhotosPicker, Core Image, task(id:) и ShareLink.
projectSlug: project-13-instafilter
---

# Project 13 — Instafilter

Instafilter выбирает фотографию, применяет Core Image filter, регулирует параметры и сохраняет или отправляет результат. Здесь встречаются разные image types и imperative framework внутри декларативного SwiftUI.

<ProjectPrerequisites slug="project-13-instafilter" />

## Рабочий vertical slice

```swift
import SwiftUI
import PhotosUI
import CoreImage
import CoreImage.CIFilterBuiltins
import UIKit

struct ContentView: View {
    @State private var item: PhotosPickerItem?
    @State private var image: Image?
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                PhotosPicker(selection: $item, matching: .images) {
                    Label("Выбрать фото", systemImage: "photo")
                }

                if let image {
                    image
                        .resizable()
                        .scaledToFit()
                        .clipShape(.rect(cornerRadius: 12))
                } else {
                    ContentUnavailableView("Фото не выбрано", systemImage: "photo")
                }
            }
            .padding()
            .navigationTitle("Instafilter")
            .task(id: item) { await loadSelection() }
            .alert("Не удалось открыть фото", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) { Button("OK", role: .cancel) {} }
        }
    }

    private func loadSelection() async {
        guard let item else { return }
        do {
            guard let data = try await item.loadTransferable(type: Data.self),
                  let uiImage = UIImage(data: data) else {
                throw CocoaError(.fileReadCorruptFile)
            }
            try Task.checkCancellation()
            image = Image(uiImage: uiImage)
        } catch is CancellationError {
            return
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview { ContentView() }
```

Сначала проверьте выбор, отмену и повторный выбор. После этого добавляйте один filter и один Slider — так ошибки PhotosPicker не смешиваются с Core Image.

## Загружаем выбор через `task(id:)`

```swift
@State private var pickerItem: PhotosPickerItem?
@State private var selectedImage: Image?
@State private var loadError: String?

.task(id: pickerItem) {
    await loadImage()
}

func loadImage() async {
    guard let pickerItem else { return }

    do {
        guard let data = try await pickerItem.loadTransferable(type: Data.self),
              let uiImage = UIImage(data: data) else {
            throw CocoaError(.fileReadCorruptFile)
        }
        try Task.checkCancellation()
        selectedImage = Image(uiImage: uiImage)
    } catch is CancellationError {
        return
    } catch {
        loadError = error.localizedDescription
    }
}
```

`PhotosPickerItem` — Optional: пользователь может ничего не выбрать. `.task(id:)` отменяет старую загрузку, когда выбран другой элемент или View исчез. Ошибку `loadTransferable` показывайте пользователю.

::: details Advanced: тяжёлая обработка
Большие фильтры не должны надолго занимать main actor. Сначала соберите рабочий single-image flow, затем отдельно изучите actor boundary, orientation и HDR. Для понимания PhotosPicker и Core Image это не требуется.
:::

## Три мира изображений

- `Image` отображается в SwiftUI;
- `UIImage` взаимодействует с UIKit и Photos;
- `CIImage` проходит через Core Image filters.

Явное преобразование между типами делает границы понятными. `CIContext` стоит переиспользовать, а filter менять по выбору пользователя.

```swift
currentFilter.setValue(inputImage, forKey: kCIInputImageKey)
currentFilter.setValue(filterIntensity, forKey: kCIInputIntensityKey)
guard let output = currentFilter.outputImage,
      let cgImage = context.createCGImage(output, from: output.extent) else { return }
processedImage = UIImage(cgImage: cgImage)
```

## Slider, Binding и разные параметры

Не каждый filter поддерживает intensity. Перед `setValue` проверь `inputKeys`, иначе Core Image получит неподходящий key.

## ConfirmationDialog и ShareLink

Dialog позволяет выбрать filter, а `ShareLink` отдаёт готовый `Transferable` системному share sheet. UI остаётся системным и доступным.

<Challenge>
<template #task>Добавь второй Slider, несколько filters и disabled state для Save/Share до появления результата.</template>
<template #knowledge>Optionals, async functions, cancellation, Binding и conditions.</template>
<template #hint1>Проверяй `currentFilter.inputKeys` перед установкой radius или scale.</template>
<template #hint2>Вычисли `canExport` из `processedImage != nil`.</template>
<template #solution>

```swift
if currentFilter.inputKeys.contains(kCIInputRadiusKey) {
    currentFilter.setValue(filterRadius * 200, forKey: kCIInputRadiusKey)
}
```

</template>
</Challenge>

<ProjectRecap slug="project-13-instafilter" />

Следующий проект добавит карту и защиту данных: [Bucket List →](/projects/project-14-bucket-list).
