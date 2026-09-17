---
title: Project 2 — Guess the Flag
description: Игра с флагами, stacks, кнопками и alerts.
projectSlug: project-02-guess-the-flag
---

# Project 2 — Guess the Flag

Соберём короткую викторину: приложение показывает три флага, просит найти страну и ведёт счёт. Главная новая тема — layout из stacks и интерактивность кнопок.

<ProjectPrerequisites slug="project-02-guess-the-flag" />

## Рабочий vertical slice

Код использует emoji вместо внешних картинок, поэтому компилируется в новом SwiftUI-проекте без дополнительных assets.

```swift
import SwiftUI

struct Country: Identifiable {
    let id = UUID()
    let name: String
    let flag: String
}

struct ContentView: View {
    @State private var countries = [
        Country(name: "Франция", flag: "🇫🇷"),
        Country(name: "Германия", flag: "🇩🇪"),
        Country(name: "Италия", flag: "🇮🇹"),
        Country(name: "Испания", flag: "🇪🇸"),
        Country(name: "Украина", flag: "🇺🇦")
    ].shuffled()
    @State private var correctAnswer = Int.random(in: 0...2)
    @State private var score = 0
    @State private var result = ""
    @State private var showingResult = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [.indigo, .black], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 24) {
                Text("Найдите флаг страны")
                    .foregroundStyle(.white.secondary)
                Text(countries[correctAnswer].name)
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)

                ForEach(0..<3) { index in
                    Button {
                        answer(index)
                    } label: {
                        Text(countries[index].flag)
                            .font(.system(size: 72))
                            .frame(maxWidth: .infinity)
                    }
                    .accessibilityLabel("Флаг: \(countries[index].name)")
                }

                Text("Счёт: \(score)")
                    .foregroundStyle(.white)
            }
            .padding()
        }
        .alert(result, isPresented: $showingResult) {
            Button("Дальше", action: nextQuestion)
        }
    }

    private func answer(_ index: Int) {
        let isCorrect = index == correctAnswer
        score += isCorrect ? 1 : 0
        result = isCorrect ? "Верно" : "Это \(countries[index].name)"
        showingResult = true
    }

    private func nextQuestion() {
        countries.shuffle()
        correctAnswer = Int.random(in: 0...2)
    }
}

#Preview { ContentView() }
```

Сначала проверьте полный цикл «вопрос → ответ → alert → следующий вопрос». Счётчик раундов добавляется самостоятельным изменением в конце статьи.

## Данные и состояние игры

```swift
@State private var countries = ["Estonia", "France", "Germany", "Ireland", "Italy", "Nigeria", "Poland", "Spain", "UK", "Ukraine", "US"].shuffled()
@State private var correctAnswer = Int.random(in: 0...2)
@State private var score = 0
```

Array, Range и случайное число — обычный Swift. `@State` сообщает SwiftUI, что после изменения вопроса или счёта экран нужно обновить.

## VStack, HStack и ZStack

`VStack` располагает View вертикально, `HStack` — горизонтально, `ZStack` накладывает слои друг на друга. Фон удобно поместить первым элементом `ZStack`, а текст и кнопки — поверх него.

```swift
ZStack {
    LinearGradient(colors: [.blue, .black], startPoint: .top, endPoint: .bottom)
        .ignoresSafeArea()

    VStack {
        Text("Guess the Flag")
        // Вопрос и кнопки
    }
}
```

<FamiliarNew :familiar="['structs', 'protocols']" :fresh="['vstack', 'hstack', 'zstack', 'modifiers']" />

## Button получает closure

```swift
ForEach(0..<3) { number in
    Button {
        flagTapped(number)
    } label: {
        Image(countries[number])
            .clipShape(.capsule)
            .shadow(radius: 5)
    }
}
```

Тело `Button` — closure: оно выполняется после нажатия. `label` тоже описан closure, но возвращает интерфейс кнопки. `ForEach` соединяет Swift Range и SwiftUI View.

## Проверка ответа и Alert

```swift
func flagTapped(_ number: Int) {
    if number == correctAnswer {
        score += 1
    } else {
        score -= 1
    }
    showingScore = true
}
```

Функция и `if` уже знакомы. Новое — `alert`, который зависит от `@State` и вызывает следующий вопрос после закрытия.

```swift
.alert(scoreTitle, isPresented: $showingScore) {
    Button("Continue", action: askQuestion)
} message: {
    Text("Your score is \(score)")
}
```

<Challenge>
<template #task>Проведи восемь раундов, затем покажи итоговый результат и кнопку новой игры. При ошибке укажи название выбранной страны.</template>
<template #knowledge>Состояние, условия, functions, `alert` и обновление Array.</template>
<template #hint1>Добавь `@State private var questionCount = 0` и увеличивай его после каждого ответа.</template>
<template #hint2>Когда счётчик достигнет восьми, покажи отдельный итоговый alert; при перезапуске обнули счёт и счётчик.</template>
<template #solution>

```swift
func askQuestion() {
    questionCount += 1
    if questionCount == 8 {
        showingFinalScore = true
    } else {
        countries.shuffle()
        correctAnswer = Int.random(in: 0...2)
    }
}
```

</template>
</Challenge>

<ProjectRecap slug="project-02-guess-the-flag" />

Дальше разберём, почему modifiers возвращают новые View и как выносить повторяющееся оформление. [Project 3 →](/projects/project-03-views-and-modifiers)
