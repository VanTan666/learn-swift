---
title: Project 15 — Accessibility
description: VoiceOver, labels, traits, Dynamic Type и reduce motion.
projectSlug: project-15-accessibility
---

# Project 15 — Accessibility

Доступность — не декоративная доработка в конце. SwiftUI даёт хорошие системные значения по умолчанию, но custom controls и визуальные игры требуют осознанного описания смысла.

<ProjectPrerequisites slug="project-15-accessibility" />

## Стартовая точка

Создай новый **iOS → App** с именем **Accessibility** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `AccessibilityApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Исходная оценка

**Цель:** Исходная оценка.

**Попробуй сам:** Покажи заголовок, пять звёзд и системный Stepper рейтинга 1…5.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var rating = 3
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack(spacing: 24) {
            Text("Оценка курса").font(.largeTitle.bold())
            HStack {
                ForEach(1...5, id: \.self) { value in
                    Image(systemName: value <= rating ? "star.fill" : "star")
                        .foregroundStyle(value <= rating ? .yellow : .secondary)
                }
            }
            .font(.largeTitle)
            Stepper("Оценка: \(rating)", value: $rating, in: 1...5)
        }
        .padding()
```


</details>

**Ожидаемый результат:** Stepper меняет количество заполненных звёзд. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Это контрольный экран для дальнейшей проверки доступности. Системный Stepper уже умеет озвучивать подпись; декоративные звёзды пока дают лишние элементы.

Сначала пройди исходный экран обычными нажатиями, затем включи VoiceOver и послушай порядок фокуса. Запиши, что озвучивается лишний раз. Так следующая правка имеет наблюдаемую цель, а не превращается в механическое добавление accessibility modifiers.

### Шаг 2. Одно осмысленное описание

**Цель:** Одно осмысленное описание.

**Попробуй сам:** Объедини звёзды в один accessibility element. Дай label «Оценка» и value «N из 5».

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** найди этот блок:

```swift
            .font(.largeTitle)
            Stepper
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            .font(.largeTitle)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Оценка")
            .accessibilityValue("\(rating) из 5")
            Stepper
```


</details>

**Ожидаемый результат:** VoiceOver на звёздах произносит одну оценку, а не пять имён символов. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Label называет элемент, value сообщает состояние. Не включай роль в label: системный trait уже отвечает за тип control.

`children: .ignore` убирает отдельные звёзды из дерева доступности и позволяет описать группу целиком. Это не скрывает их визуально. После изменения должен остаться один фокусируемый элемент с текущим значением, а не пять одинаково названных иконок.

### Шаг 3. Регулировка VoiceOver

**Цель:** Регулировка VoiceOver.

**Попробуй сам:** Добавь adjustable action к группе звёзд. Ограничь увеличение и уменьшение диапазоном 1…5.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** найди этот блок:

```swift
            .accessibilityValue("\(rating) из 5")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            .accessibilityValue("\(rating) из 5")
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: rating = min(5, rating + 1)
                case .decrement: rating = max(1, rating - 1)
                default: break
                }
            }
```


</details>

**Ожидаемый результат:** Свайпы вверх и вниз при фокусе VoiceOver меняют оценку; границы не нарушаются. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Custom control должен давать действие, а не только описание. Stepper сохраняем как видимый альтернативный способ управления.

VoiceOver передаёт направление increment или decrement. min и max ограничивают результат, даже если пользователь продолжает свайпать на границе. В ветке default ничего не меняем. Сравни управление звёздами и Stepper: они должны читать и менять одну rating.

### Шаг 4. Крупный текст и смысл без цвета

**Цель:** Крупный текст и смысл без цвета.

**Попробуй сам:** Помести контент в ScrollView и добавь видимую текстовую оценку, скрыв её дубль от VoiceOver. Проверь максимальный Dynamic Type.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** найди этот блок:

```swift
        VStack(spacing: 24) {
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        ScrollView {
        VStack(spacing: 24) {
```

В **ContentView.swift** найди этот блок:

```swift
            Stepper("Оценка: \(rating)"
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            Text("\(rating) из 5").accessibilityHidden(true)
            Stepper("Оценка: \(rating)"
```

В **ContentView.swift** найди этот блок:

```swift
        .padding()
    }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        .padding()
        }
    }
```


</details>

**Ожидаемый результат:** При крупном тексте контент прокручивается. Значение понятно даже без различения жёлтого и серого. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Семантические шрифты масштабируются. Дополнительная подпись помогает зрячим пользователям, но accessibilityHidden убирает повтор уже озвученного значения.

Не задавай фиксированную высоту всему текстовому экрану: при крупных шрифтах строки требуют больше места. ScrollView даёт возможность добраться до элементов, не помещающихся по высоте. Видимая подпись «N из 5» дублирует смысл формы звёзд и не полагается на один цвет.

### Шаг 5. Reduce Motion

**Цель:** Reduce Motion.

**Попробуй сам:** Добавь короткую анимацию изменения оценки с учётом environment accessibilityReduceMotion.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
```

В **ContentView.swift** найди этот блок:

```swift
        .padding()
        }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        .padding()
        .animation(reduceMotion ? nil : .easeInOut, value: rating)
        }
```


</details>

**Ожидаемый результат:** Оценка меняется в обоих режимах; с Reduce Motion переход мгновенный. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Предпочтение пользователя меняет эффект, а не доступность действия. Проверяй результат реальным управлением VoiceOver; одной проверки компиляции недостаточно.

Environment value автоматически обновляется при смене системной настройки. Не сохраняй его копию как пользовательскую настройку приложения, иначе она может устареть. Проверка доступности включает не только внешний вид: после отключения анимации все действия должны оставаться достижимыми.

## Глубже — необязательно

::: details Глубже: ручной аудит
Пройди экран VoiceOver без взгляда на него, затем включи Voice Control, Increase Contrast, Differentiate Without Color и Reduce Transparency. Accessibility Inspector помогает найти проблемы, но не заменяет управление на устройстве.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь кнопку «Сбросить» с иконкой и понятной подписью VoiceOver.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Используй Label, а не неименованное изображение-кнопку.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
Button { rating = 3 } label: {
    Label("Сбросить оценку", systemImage: "arrow.counterclockwise")
}
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

struct ContentView: View {
    @State private var rating = 3

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ScrollView {
        VStack(spacing: 24) {
            Text("Оценка курса").font(.largeTitle.bold())
            HStack {
                ForEach(1...5, id: \.self) { value in
                    Image(systemName: value <= rating ? "star.fill" : "star")
                        .foregroundStyle(value <= rating ? .yellow : .secondary)
                }
            }
            .font(.largeTitle)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Оценка")
            .accessibilityValue("\(rating) из 5")
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: rating = min(5, rating + 1)
                case .decrement: rating = max(1, rating - 1)
                default: break
                }
            }
            Text("\(rating) из 5").accessibilityHidden(true)
            Stepper("Оценка: \(rating)", value: $rating, in: 1...5)
        }
        .padding()
        .animation(reduceMotion ? nil : .easeInOut, value: rating)
        }
    }
}
```

### AccessibilityApp.swift

```swift
import SwiftUI

@main
struct AccessibilityApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

</details>

<ProjectRecap slug="project-15-accessibility" />

Следующий проект соединит shared state, QR и notifications: [Hot Prospects →](/projects/project-16-hot-prospects).
