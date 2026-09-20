---
title: Project 13 — Instafilter
description: PhotosPicker, Core Image, task(id:) и ShareLink.
projectSlug: project-13-instafilter
---

# Project 13 — Instafilter

Instafilter выбирает фотографию, применяет Core Image filter, регулирует параметры и сохраняет или отправляет результат. Здесь встречаются разные image types и imperative framework внутри декларативного SwiftUI.

<ProjectPrerequisites slug="project-13-instafilter" />

## Стартовая точка

Создай новый **iOS → App** с именем **Instafilter** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `InstafilterApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Системный выбор фотографии

**Цель:** Системный выбор фотографии.

**Попробуй сам:** Добавь PhotosPickerItem? в state и PhotosPicker. Пока показывай только факт наличия выбранного элемента.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import PhotosUI
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var item: PhotosPickerItem?
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            VStack(spacing: 20) {
                PhotosPicker(selection: $item, matching: .images) {
                    Label("Выбрать фото", systemImage: "photo")
                }
                Text(item == nil ? "Фото не выбрано" : "Элемент выбран")
            }
            .padding()
            .navigationTitle("Instafilter")
        }
```


</details>

**Ожидаемый результат:** Открывается системный picker; после выбора подпись меняется. Отмена не вызывает ошибку. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** PhotosPickerItem — ссылка на выбранный ресурс, ещё не декодированное изображение. Picker предоставляет выбранный элемент, не доступ ко всей медиатеке.

Optional начинается с nil, потому что пользователь ещё ничего не выбрал. Отмена системного окна не обязана создавать новый элемент или очищать прежний выбор. На этом шаге проверяем только сам выбор: наличие PhotosPickerItem ещё не означает, что байты фотографии уже находятся в памяти приложения.

### Шаг 2. Загрузка и отображение

**Цель:** Загрузка и отображение.

**Попробуй сам:** Загрузи Data через loadTransferable, декодируй UIImage и покажи SwiftUI Image. Привяжи загрузку к task(id: item), обработай ошибку.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import UIKit
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var image: Image?
    @State private var errorMessage: String?
    private func load() async {
        guard let item else { return }
        do {
            guard let data = try await item.loadTransferable(type: Data.self),
                  let original = UIImage(data: data) else { throw CocoaError(.fileReadCorruptFile) }
            try Task.checkCancellation()
            image = Image(uiImage: original)
            errorMessage = nil
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }
```

В **ContentView.swift** найди этот блок:

```swift
Text(item == nil ? "Фото не выбрано" : "Элемент выбран")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
if let image {
                    image.resizable().scaledToFit()
                } else {
                    ContentUnavailableView("Фото не выбрано", systemImage: "photo")
                }
                if let errorMessage { Text(errorMessage).foregroundStyle(.red) }
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle("Instafilter")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle("Instafilter")
            .task(id: item) { await load() }
```


</details>

**Ожидаемый результат:** Выбранная фотография отображается; повторный выбор заменяет её, ошибка выводится текстом. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** task(id:) перезапускается при изменении item и отменяет предыдущую задачу. Проверка cancellation перед записью в state предотвращает перезапись новой фотографии старой загрузкой.

Загрузка может ждать ресурс из iCloud, поэтому API асинхронный. Возвращённые Data тоже optional; затем UIImage может не суметь декодировать их. Оба случая проверяются одним guard. Ошибка показывается отдельно от изображения, а отменённая старая задача не должна заменять новый результат.

### Шаг 3. Один Core Image filter

**Цель:** Один Core Image filter.

**Попробуй сам:** Сохрани оригинальный UIImage и добавь функцию applyFilter. Преобразуй его в CIImage, примени sepiaTone и отрисуй через переиспользуемый CIContext.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import CoreImage
import CoreImage.CIFilterBuiltins
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var sourceImage: UIImage?
    private let context = CIContext()
    private func applyFilter() {
        guard let sourceImage,
              let input = CIImage(image: sourceImage, options: [.applyOrientationProperty: true]) else { return }
        let filter = CIFilter.sepiaTone()
        filter.inputImage = input
        filter.intensity = 0.7
        guard let output = filter.outputImage,
              let result = context.createCGImage(output, from: output.extent) else {
            errorMessage = "Не удалось применить фильтр"
            return
        }
        image = Image(uiImage: UIImage(cgImage: result))
        errorMessage = nil
    }
```

В **ContentView.swift** найди этот блок:

```swift
image = Image(uiImage: original)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
sourceImage = original
            applyFilter()
```

В **ContentView.swift** найди этот блок:

```swift
            applyFilter()
            errorMessage = nil
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            applyFilter()
```


</details>

**Ожидаемый результат:** После выбора фото показывается сепия; ошибка обработки видна под изображением. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** UIImage хранит изображение UIKit, CIImage описывает обработку, Image отображает результат. Orientation учитываем при создании CIImage, чтобы фото с камеры не поворачивалось неожиданно.

Filter не возвращает SwiftUI Image напрямую. Сначала его inputImage получает CIImage, затем outputImage описывает результат, а CIContext создаёт пиксели CGImage. UIImage оборачивает их для последнего перехода к Image. Контекст хранится как свойство, чтобы не создавать его заново на каждый сдвиг ползунка.

### Шаг 4. Интенсивность без повторной загрузки

**Цель:** Интенсивность без повторной загрузки.

**Попробуй сам:** Добавь Slider 0…1. Изменение интенсивности повторяет только фильтр, а не чтение выбранного ресурса.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var intensity = 0.7
```

В **ContentView.swift** найди этот блок:

```swift
filter.intensity = 0.7
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
filter.intensity = Float(intensity)
```

В **ContentView.swift** найди этот блок:

```swift
                if let errorMessage
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                Slider(value: $intensity, in: 0...1) { Text("Интенсивность") }
                    .disabled(sourceImage == nil)
                    .onChange(of: intensity) { applyFilter() }
                if let errorMessage
```


</details>

**Ожидаемый результат:** Ползунок плавно меняет силу сепии, выбор фотографии сохраняется. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** onChange запускает синхронную обработку текущего оригинала. Фильтруем исходник, не предыдущий результат, иначе искажения накапливались бы.

`Float(intensity)` преобразует Double ползунка в тип параметра фильтра. Ноль означает отсутствие сепии, единица — максимальную интенсивность. SourceImage сохраняется отдельно от image, поэтому повторная обработка всегда начинается с одного оригинала.

### Шаг 5. Выбор фильтра через dialog

**Цель:** Выбор фильтра через dialog.

**Попробуй сам:** Добавь confirmationDialog с вариантами «Сепия» и «Без фильтра». Храни выбор в enum и пересчитывай изображение.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    enum Mode { case sepia, original }
    @State private var mode = Mode.sepia
    @State private var showingFilters = false
```

В **ContentView.swift** найди этот блок:

```swift
        let filter = CIFilter.sepiaTone()
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        if mode == .original {
            image = Image(uiImage: sourceImage)
            errorMessage = nil
            return
        }
        let filter = CIFilter.sepiaTone()
```

В **ContentView.swift** найди этот блок:

```swift
.disabled(sourceImage == nil)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.disabled(sourceImage == nil || mode == .original)
```

В **ContentView.swift** найди этот блок:

```swift
                Slider(value: $intensity
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                Button("Фильтр") { showingFilters = true }
                    .disabled(sourceImage == nil)
                    .confirmationDialog("Выбери фильтр", isPresented: $showingFilters) {
                        Button("Сепия") { mode = .sepia; applyFilter() }
                        Button("Без фильтра") { mode = .original; applyFilter() }
                    }
                Slider(value: $intensity
```


</details>

**Ожидаемый результат:** Выбор «Без фильтра» возвращает оригинал; сепия использует сохранённую интенсивность. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Enum ограничивает допустимые режимы. Системный dialog показывает действия по явному запросу пользователя. Ползунок отключаем там, где у режима нет интенсивности.

Enum Mode гарантирует, что режим имеет одно из двух допустимых значений. В оригинальном режиме функция возвращается до создания фильтра. Это также объясняет disabled у Slider: интерфейс не предлагает менять параметр, который сейчас не используется.

### Шаг 6. Передача результата

**Цель:** Передача результата.

**Попробуй сам:** Добавь ShareLink только при наличии image. Передай preview того же обработанного изображения.

<details>
<summary>Показать решение шага 6</summary>

В **ContentView.swift** найди этот блок:

```swift
image.resizable().scaledToFit()
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
image.resizable().scaledToFit()
                    ShareLink(item: image, preview: SharePreview("Instafilter", image: image))
```


</details>

**Ожидаемый результат:** После обработки доступна системная кнопка отправки; до выбора фото экспорт отсутствует. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** ShareLink работает с Transferable. Экспортируется текущий результат, поэтому пользователь получает именно то, что видит на экране.

Условное `if let image` раскрывает Optional и даёт конкретное изображение для preview и передачи. До этого состояния ShareLink не существует, поэтому нельзя отправить пустой результат. Выбери фотографию, измени интенсивность, затем открой системное меню и сравни его preview с экраном.

## Глубже — необязательно

::: details Advanced: большие изображения и другие фильтры
Учебная обработка синхронная: на большой фотографии Slider может тормозить. Следующий отдельный этап — измерение стоимости и перенос обработки с учётом actor boundaries. HDR и сложные цветовые пространства сюда не входят. Для фильтров с radius или scale проверяй поддерживаемые inputKeys, прежде чем задавать параметры.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь кнопку сброса интенсивности на 0.7 и проверь её в обоих режимах.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Сброс меняет только state; уже подключённый onChange применит фильтр.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
Button("Сбросить интенсивность") { intensity = 0.7 }
    .disabled(sourceImage == nil || mode == .original)
```

</template>
</Challenge>

## Reference: полный код проекта

Основной маршрут, без самостоятельного challenge. Используй этот блок для сверки уже собранного приложения.

<details>
<summary>Открыть все итоговые файлы проекта</summary>

### ContentView.swift

```swift
import SwiftUI
import CoreImage
import CoreImage.CIFilterBuiltins

import UIKit

import PhotosUI


struct ContentView: View {
    @State private var item: PhotosPickerItem?

    @State private var image: Image?
    @State private var errorMessage: String?
    private func load() async {
        guard let item else { return }
        do {
            guard let data = try await item.loadTransferable(type: Data.self),
                  let original = UIImage(data: data) else { throw CocoaError(.fileReadCorruptFile) }
            try Task.checkCancellation()
            sourceImage = original
            applyFilter()
        } catch {
            guard !Task.isCancelled else { return }
            errorMessage = error.localizedDescription
        }
    }

    @State private var sourceImage: UIImage?
    private let context = CIContext()
    private func applyFilter() {
        guard let sourceImage,
              let input = CIImage(image: sourceImage, options: [.applyOrientationProperty: true]) else { return }
        if mode == .original {
            image = Image(uiImage: sourceImage)
            errorMessage = nil
            return
        }
        let filter = CIFilter.sepiaTone()
        filter.inputImage = input
        filter.intensity = Float(intensity)
        guard let output = filter.outputImage,
              let result = context.createCGImage(output, from: output.extent) else {
            errorMessage = "Не удалось применить фильтр"
            return
        }
        image = Image(uiImage: UIImage(cgImage: result))
        errorMessage = nil
    }

    @State private var intensity = 0.7

    enum Mode { case sepia, original }
    @State private var mode = Mode.sepia
    @State private var showingFilters = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                PhotosPicker(selection: $item, matching: .images) {
                    Label("Выбрать фото", systemImage: "photo")
                }
                if let image {
                    image.resizable().scaledToFit()
                    ShareLink(item: image, preview: SharePreview("Instafilter", image: image))
                } else {
                    ContentUnavailableView("Фото не выбрано", systemImage: "photo")
                }
                Button("Фильтр") { showingFilters = true }
                    .disabled(sourceImage == nil)
                    .confirmationDialog("Выбери фильтр", isPresented: $showingFilters) {
                        Button("Сепия") { mode = .sepia; applyFilter() }
                        Button("Без фильтра") { mode = .original; applyFilter() }
                    }
                Slider(value: $intensity, in: 0...1) { Text("Интенсивность") }
                    .disabled(sourceImage == nil || mode == .original)
                    .onChange(of: intensity) { applyFilter() }
                if let errorMessage { Text(errorMessage).foregroundStyle(.red) }
            }
            .padding()
            .navigationTitle("Instafilter")
            .task(id: item) { await load() }
        }
    }
}
```

### InstafilterApp.swift

```swift
import SwiftUI

@main
struct InstafilterApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

</details>

<ProjectRecap slug="project-13-instafilter" />

Следующий проект добавит карту и защиту данных: [Bucket List →](/projects/project-14-bucket-list).
