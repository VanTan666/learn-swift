---
title: Project 2 — Guess the Flag
description: Игра с флагами, stacks, кнопками и alerts.
projectSlug: project-02-guess-the-flag
---

# Project 2 — Guess the Flag

Соберём короткую викторину: приложение показывает три флага, просит найти страну и ведёт счёт. Главная новая тема — layout из stacks и интерактивность кнопок.

<ProjectPrerequisites slug="project-02-guess-the-flag" />

## Стартовая точка

Создай новый **iOS → App** с именем **GuessTheFlag** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `GuessTheFlagApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Вертикальная композиция

**Цель:** Вертикальная композиция.

**Попробуй сам:** Покажи заголовок «Найдите флаг страны» и три названия стран друг под другом. Пока это неподвижный экран.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack(spacing: 24) {
            Text("Найдите флаг страны")
            Text("Франция")
            Text("Германия")
            Text("Италия")
        }
```


</details>

**Ожидаемый результат:** Видны заголовок, Франция, Германия и Италия. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `VStack` размещает дочерние View по вертикали; spacing задаёт промежуток. Из WeSplit ты уже знаешь Text и modifiers — здесь меняется только компоновка.

У `VStack` есть closure с содержимым: каждая строка `Text` внутри неё описывает отдельный дочерний элемент. `spacing: 24` измеряется в точках интерфейса, а не в физических пикселях. Сначала замени 24 на 8 и запусти экран — так легче связать параметр с видимым результатом.

### Шаг 2. Фон отдельным слоем

**Цель:** Фон отдельным слоем.

**Попробуй сам:** Помести готовый VStack поверх градиента от indigo к black. Сделай текст белым.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** найди этот блок:

```swift
VStack(spacing: 24) {
            Text("Найдите флаг страны")
            Text("Франция")
            Text("Германия")
            Text("Италия")
        }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
ZStack {
            LinearGradient(colors: [.indigo, .black], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            VStack(spacing: 24) {
                Text("Найдите флаг страны")
                Text("Франция")
                Text("Германия")
                Text("Италия")
            }
            .foregroundStyle(.white)
        }
```


</details>

**Ожидаемый результат:** Градиент занимает весь экран, надписи читаются поверх него. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `ZStack` накладывает элементы в порядке объявления. `ignoresSafeArea()` применяем к фону: содержимое остаётся внутри безопасной области.

Внутри `ZStack` градиент объявлен первым и оказывается сзади. Если поменять местами фон и `VStack`, непрозрачный фон закроет надписи. У `LinearGradient` массив `colors` задаёт цвета, `startPoint` и `endPoint` — направление. `foregroundStyle(.white)` наследуется текстами вложенного стека, поэтому не нужно повторять цвет у каждой надписи.

### Шаг 3. Данные вместо повторяющегося текста

**Цель:** Данные вместо повторяющегося текста.

**Попробуй сам:** Объяви Country с name и flag. Создай массив трёх стран. Через ForEach покажи emoji-флаги в HStack под заголовком.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь код перед строкой `struct ContentView: View {`:

```swift
struct Country {
    let name: String
    let flag: String
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var countries = [
        Country(name: "Франция", flag: "🇫🇷"),
        Country(name: "Германия", flag: "🇩🇪"),
        Country(name: "Италия", flag: "🇮🇹")
    ]
```

В **ContentView.swift** найди этот блок:

```swift
Text("Франция")
                Text("Германия")
                Text("Италия")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
HStack {
                    ForEach(countries, id: \.name) { country in
                        Text(country.flag).font(.system(size: 64))
                    }
                }
```


</details>

**Ожидаемый результат:** Три emoji-флага стоят в строку; внешние изображения не нужны. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Именованный struct связывает название и флаг. `ForEach` получает стабильный ключ name; `HStack` размещает элементы горизонтально. Эти данные позже можно менять, поэтому массив принадлежит @State.

Запись `id: \.name` — key path: способ указать свойство, по которому SwiftUI различает элементы. Это не строка с названием свойства. В нашем массиве названия уникальны, поэтому ключ подходит. Внутри closure имя `country` обозначает один элемент, а `country.flag` — его emoji. Добавь ещё один `Text(country.name)` под флагом и проверь, что данные не перепутались.

### Шаг 4. Ответ и счёт

**Цель:** Ответ и счёт.

**Попробуй сам:** Выбери случайный индекс 0…2 и покажи соответствующее название. Преврати флаги в кнопки: правильное нажатие добавляет одно очко. Отобрази счёт под флагами.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var correctAnswer = Int.random(in: 0...2)
    @State private var score = 0

    private func answer(_ index: Int) {
        if index == correctAnswer { score += 1 }
    }
```

В **ContentView.swift** найди этот блок:

```swift
Text("Найдите флаг страны")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Text("Найдите флаг страны")
                Text(countries[correctAnswer].name).font(.title.bold())
```

В **ContentView.swift** найди этот блок:

```swift
ForEach(countries, id: \.name) { country in
                        Text(country.flag).font(.system(size: 64))
                    }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
ForEach(0..<3) { index in
                        Button { answer(index) } label: {
                            Text(countries[index].flag).font(.system(size: 64))
                        }
                        .accessibilityLabel("Флаг: \(countries[index].name)")
                    }
```

В **ContentView.swift** найди этот блок:

```swift
                }
            }
            .foregroundStyle(.white)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                }
                Text("Счёт: \(score)")
            }
            .foregroundStyle(.white)
```


</details>

**Ожидаемый результат:** Выбранная страна написана над кнопками. Правильный ответ увеличивает счёт, неправильный оставляет прежним. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Кнопка запускает closure. Индекс связывает вопрос с вариантом ответа; функция answer отделяет проверку от View. На этом этапе повторное нажатие правильной кнопки снова даёт очко — пока каждый tap является отдельной попыткой.

У `Button { ... } label: { ... }` две closure: первая выполняется при нажатии, вторая описывает внешний вид. Поэтому `answer(index)` находится в action, а `Text` — в label. Индексы 0, 1 и 2 соответствуют трём позициям массива. Если поменять `correctAnswer`, изменится и текст вопроса: для него используется тот же индекс, что и при проверке.

### Шаг 5. Обратная связь через alert

**Цель:** Обратная связь через alert.

**Попробуй сам:** После ответа показывай «Верно» либо название нажатой страны. Пока окно открыто, второй ответ не принимается.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var result = ""
    @State private var showingResult = false
```

В **ContentView.swift** найди этот блок:

```swift
if index == correctAnswer { score += 1 }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
guard !showingResult else { return }
        let isCorrect = index == correctAnswer
        if isCorrect { score += 1 }
        result = isCorrect ? "Верно" : "Это \(countries[index].name)"
        showingResult = true
```

В **ContentView.swift** найди этот блок:

```swift
            .foregroundStyle(.white)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            .foregroundStyle(.white)
            .alert(result, isPresented: $showingResult) {
                Button("OK") { }
            }
```


</details>

**Ожидаемый результат:** Правильный и неправильный ответы вызывают разные сообщения. Закрытие OK возвращает на тот же вопрос. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `alert` получает Binding к Bool, а строка result задаёт сообщение. Состояние результата отдельно от счёта: оба описывают разные части игры.

`showingResult` отвечает только на вопрос «открыт ли alert», а `result` хранит его содержание. Передавая `$showingResult`, мы разрешаем SwiftUI записать `false` при закрытии окна. Строка при этом не обязана очищаться — она не делает alert видимым сама по себе. Проверь ошибочный ответ: счёт не должен измениться, хотя окно появляется.

### Шаг 6. Следующий вопрос

**Цель:** Следующий вопрос.

**Попробуй сам:** Замени OK на «Дальше». После закрытия перемешай страны и выбери новый правильный индекс. Счёт сохрани.

<details>
<summary>Показать решение шага 6</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private func nextQuestion() {
        countries.shuffle()
        correctAnswer = Int.random(in: 0...2)
    }
```

В **ContentView.swift** найди этот блок:

```swift
Button("OK") { }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Button("Дальше", action: nextQuestion)
```


</details>

**Ожидаемый результат:** После ответа кнопка «Дальше» меняет порядок флагов. Несколько раундов сохраняют суммарный счёт; повтор той же страны допустим. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `shuffle()` меняет текущий массив. Генератор случайных чисел может выбрать предыдущий индекс — это нормальный новый вопрос, а не ошибка навигации.

`shuffle()` изменяет массив на месте, а `shuffled()` возвращает новую перемешанную копию. Здесь нужна первая операция, потому что экран читает существующий `@State`. Сначала переставляем страны, затем выбираем индекс из допустимого диапазона. Для проверки сыграй несколько вопросов и убедись, что счёт не обнуляется между ними.

## Самостоятельное изменение

<Challenge>
<template #task>Ограничь игру восемью вопросами. На восьмом ответе покажи итог и кнопку перезапуска.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Считай ответы в answer; в nextQuestion после восьмого результата перезапускай состояние.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
// Добавь в ContentView:
@State private var rounds = 0
// В answer после guard:
rounds += 1
// В nextQuestion перед shuffle:
if rounds == 8 { rounds = 0; score = 0 }
// Для заголовка итогового alert используй:
// rounds == 8 ? "Итог: \(score) из 8" : result
// Для подписи его кнопки: rounds == 8 ? "Новая игра" : "Дальше"
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

struct Country {
    let name: String
    let flag: String
}

struct ContentView: View {
    @State private var countries = [
        Country(name: "Франция", flag: "🇫🇷"),
        Country(name: "Германия", flag: "🇩🇪"),
        Country(name: "Италия", flag: "🇮🇹")
    ]

    @State private var correctAnswer = Int.random(in: 0...2)
    @State private var score = 0

    private func answer(_ index: Int) {
        guard !showingResult else { return }
        let isCorrect = index == correctAnswer
        if isCorrect { score += 1 }
        result = isCorrect ? "Верно" : "Это \(countries[index].name)"
        showingResult = true
    }

    @State private var result = ""
    @State private var showingResult = false

    private func nextQuestion() {
        countries.shuffle()
        correctAnswer = Int.random(in: 0...2)
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [.indigo, .black], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            VStack(spacing: 24) {
                Text("Найдите флаг страны")
                Text(countries[correctAnswer].name).font(.title.bold())
                HStack {
                    ForEach(0..<3) { index in
                        Button { answer(index) } label: {
                            Text(countries[index].flag).font(.system(size: 64))
                        }
                        .accessibilityLabel("Флаг: \(countries[index].name)")
                    }
                }
                Text("Счёт: \(score)")
            }
            .foregroundStyle(.white)
            .alert(result, isPresented: $showingResult) {
                Button("Дальше", action: nextQuestion)
            }
        }
    }
}
```

### GuessTheFlagApp.swift

```swift
import SwiftUI

@main
struct GuessTheFlagApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

</details>

<ProjectRecap slug="project-02-guess-the-flag" />

Дальше разберём, почему modifiers возвращают новые View и как выносить повторяющееся оформление. [Project 3 →](/projects/project-03-views-and-modifiers)
