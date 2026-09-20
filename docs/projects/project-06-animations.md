---
title: Project 6 — Animations
description: Неявные, явные и gesture-driven анимации SwiftUI.
projectSlug: project-06-animations
---

# Project 6 — Animations

SwiftUI анимирует переход между двумя состояниями. Важно сначала правильно описать начальное и конечное состояние, а уже затем выбрать кривую и длительность.

<ProjectPrerequisites slug="project-06-animations" />

## Стартовая точка

Создай новый **iOS → App** с именем **Animations** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `AnimationsApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Два состояния карточки

**Цель:** Два состояния карточки.

**Попробуй сам:** Покажи RoundedRectangle и кнопку переключения цвета между indigo и orange.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var enabled = false
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack(spacing: 40) {
            RoundedRectangle(cornerRadius: 24)
                .fill(enabled ? .orange : .indigo)
                .frame(width: 180, height: 180)
            Button("Сменить цвет") { enabled.toggle() }
        }
        .padding()
```


</details>

**Ожидаемый результат:** Цвет переключается мгновенно, размер карточки постоянный. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Форма и состояние независимы от анимации. Сначала задаём начальное и конечное значения, чтобы было понятно, что именно меняется.

`fill` получает один из двух цветов по тернарному выражению. Когда `enabled` меняется, SwiftUI получает другое описание той же формы. Сейчас переход мгновенный — это полезная исходная проверка. Если цвет не меняется без анимации, подбор duration эту ошибку не исправит.

### Шаг 2. Неявная анимация

**Цель:** Неявная анимация.

**Попробуй сам:** Добавь animation(value:) к форме; наблюдай только enabled.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** найди этот блок:

```swift
.frame(width: 180, height: 180)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.frame(width: 180, height: 180)
                .animation(.easeInOut, value: enabled)
```


</details>

**Ожидаемый результат:** Цвет меняется плавно после каждого tap. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `animation(_:value:)` связывает анимацию с конкретным изменяющимся значением. Кривая easeInOut замедляет начало и конец перехода.

Параметр `value` — не цель анимации, а значение, изменение которого запускает переход. Сама цель описана через `fill(enabled ? ... : ...)`. Попробуй увеличить длительность через `.easeInOut(duration: 2)`: станет заметно, что SwiftUI рисует промежуточные состояния между двумя цветами.

### Шаг 3. Явный переход

**Цель:** Явный переход.

**Попробуй сам:** Удали animation(value:) с карточки и оберни переключение enabled в withAnimation.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** найди этот блок:

```swift
                .animation(.easeInOut, value: enabled)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift

```

В **ContentView.swift** найди этот блок:

```swift
Button("Сменить цвет") { enabled.toggle() }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Button("Сменить цвет") { withAnimation(.easeInOut) { enabled.toggle() } }
```


</details>

**Ожидаемый результат:** Цвет по-прежнему меняется плавно; переход теперь задан в действии кнопки. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `withAnimation` отмечает изменение состояния. Не складывай два механизма для одного эффекта без причины: здесь мы сравниваем их на одинаковом результате.

Closure `withAnimation` выполняется сразу: `enabled` не ждёт окончания перехода. SwiftUI лишь сопровождает визуальное обновление анимацией. Поэтому это не средство задержки и не замена Timer. Здесь явная анимация даёт тот же видимый результат, но место её настройки находится рядом с действием.

### Шаг 4. Перетаскивание

**Цель:** Перетаскивание.

**Попробуй сам:** Добавь CGSize в @State, offset и DragGesture. Во время жеста обновляй translation; после отпускания возвращай карточку пружиной.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var drag = CGSize.zero
```

В **ContentView.swift** найди этот блок:

```swift
.frame(width: 180, height: 180)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.frame(width: 180, height: 180)
                .offset(drag)
                .gesture(DragGesture()
                    .onChanged { drag = $0.translation }
                    .onEnded { _ in withAnimation(.spring()) { drag = .zero } }
                )
```


</details>

**Ожидаемый результат:** Карточка следует за пальцем и возвращается в исходное место. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Жест сообщает смещение от начала, а offset применяет его к View. Пружину запускаем только при отпускании, чтобы карточка не отставала от пальца во время движения.

`translation` — пройденное от начала жеста расстояние по двум осям, а не абсолютная позиция пальца на экране. `CGSize.zero` означает нулевое смещение. `onChanged` может вызываться много раз за один жест, `onEnded` — при завершении. Попробуй отпустить карточку слева и справа: обе ветки возвращают её к исходной позиции.

### Шаг 5. Появление и удаление

**Цель:** Появление и удаление.

**Попробуй сам:** Добавь кнопку показа/скрытия и if вокруг карточки. Используй transition opacity. При скрытии сбрасывай drag.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var isVisible = true
```

В **ContentView.swift** найди этот блок:

```swift
            RoundedRectangle(cornerRadius: 24)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            if isVisible {
            RoundedRectangle(cornerRadius: 24)
```

В **ContentView.swift** найди этот блок:

```swift
                )
            Button("Сменить цвет")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                )
                .transition(.opacity)
            }
            Button(isVisible ? "Скрыть" : "Показать") {
                withAnimation { isVisible.toggle(); drag = .zero }
            }
            Button("Сменить цвет")
```


</details>

**Ожидаемый результат:** Карточка плавно исчезает и появляется; её отсутствие освобождает место в VStack. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Transition применяется к вставке и удалению View. В отличие от изменения цвета, здесь меняется состав дерева интерфейса.

Условный `if` действительно удаляет карточку из композиции. `.transition(.opacity)` описывает, как показать это изменение; без анимированного изменения `isVisible` оно произойдёт мгновенно. Кнопка переключения остаётся вне if, иначе после скрытия карточки можно было бы потерять и способ вернуть её.

### Шаг 6. Уменьшение движения

**Цель:** Уменьшение движения.

**Попробуй сам:** Прочитай accessibilityReduceMotion. При включённой настройке используй nil вместо анимаций.

<details>
<summary>Показать решение шага 6</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
```

В **ContentView.swift** найди этот блок:

```swift
withAnimation(.spring())
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
withAnimation(reduceMotion ? nil : .spring())
```

В **ContentView.swift** найди этот блок:

```swift
withAnimation { isVisible
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
withAnimation(reduceMotion ? nil : .easeInOut) { isVisible
```

В **ContentView.swift** найди этот блок:

```swift
withAnimation(.easeInOut)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
withAnimation(reduceMotion ? nil : .easeInOut)
```


</details>

**Ожидаемый результат:** С Reduce Motion карточка меняет состояние без пружины; жест и кнопки сохраняют смысл. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Environment сообщает предпочтение пользователя. Меняется визуальный переход, но само действие и итоговое состояние остаются теми же.

Выражение `reduceMotion ? nil : .spring()` выбирает отсутствие анимации либо пружину. Оно не отменяет присваивание `drag = .zero`. Это важное различие: настройка доступности убирает движение, а не функцию приложения. Проверь также кнопку показа карточки — предпочтение должно соблюдаться во всех введённых эффектах.

## Самостоятельное изменение

<Challenge>
<template #task>Скрывай карточку, если отпустили её дальше 150 точек по горизонтали; короткий жест возвращай назад.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Измени только onEnded, используй то же isVisible.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
.onEnded { value in
    withAnimation(reduceMotion ? nil : .spring()) {
        if abs(value.translation.width) > 150 { isVisible = false }
        drag = .zero
    }
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
    @State private var enabled = false

    @State private var drag = CGSize.zero

    @State private var isVisible = true

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(spacing: 40) {
            if isVisible {
            RoundedRectangle(cornerRadius: 24)
                .fill(enabled ? .orange : .indigo)
                .frame(width: 180, height: 180)
                .offset(drag)
                .gesture(DragGesture()
                    .onChanged { drag = $0.translation }
                    .onEnded { _ in withAnimation(reduceMotion ? nil : .spring()) { drag = .zero } }
                )
                .transition(.opacity)
            }
            Button(isVisible ? "Скрыть" : "Показать") {
                withAnimation(reduceMotion ? nil : .easeInOut) { isVisible.toggle(); drag = .zero }
            }
            Button("Сменить цвет") { withAnimation(reduceMotion ? nil : .easeInOut) { enabled.toggle() } }
        }
        .padding()
    }
}
```

### AnimationsApp.swift

```swift
import SwiftUI

@main
struct AnimationsApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

</details>

<ProjectRecap slug="project-06-animations" />

Закрепи вторую группу в [Milestone Projects 4–6 →](/projects/milestone-04-06).
