---
title: Project 5 — Word Scramble
description: Игра со словами, List, Bundle и проверкой ввода.
projectSlug: project-05-word-scramble
---

# Project 5 — Word Scramble

Игрок получает исходное слово и составляет из его букв новые. Проект хорошо показывает, как Array хранит данные интерфейса, а небольшие functions образуют последовательность проверок.

<ProjectPrerequisites slug="project-05-word-scramble" />

## Рабочий vertical slice

```swift
import SwiftUI

struct ContentView: View {
    @State private var rootWord = "разработка"
    @State private var newWord = ""
    @State private var usedWords: [String] = []
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            List {
                Section("Слово: \(rootWord)") {
                    TextField("Новое слово", text: $newWord)
                        .textInputAutocapitalization(.never)
                        .onSubmit(addWord)
                }

                Section("Найдено: \(usedWords.count)") {
                    ForEach(usedWords, id: \.self) { word in
                        Label(word, systemImage: "character.book.closed")
                    }
                }
            }
            .navigationTitle("Word Scramble")
            .alert("Слово не принято", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private func addWord() {
        let answer = newWord.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        guard answer.count >= 3 else { errorMessage = "Минимум три буквы"; return }
        guard answer != rootWord else { errorMessage = "Нужно другое слово"; return }
        guard !usedWords.contains(answer) else { errorMessage = "Слово уже было"; return }

        usedWords.insert(answer, at: 0)
        newWord = ""
    }
}

#Preview { ContentView() }
```

Этот slice проверяет ввод, дубли и список. Проверку букв исходного слова и системный словарь добавляйте по одной, сохраняя рабочее состояние после каждого шага.

## Загружаем ресурс из Bundle

Текстовый файл включается в приложение. `Bundle.main.url` возвращает Optional: ресурс мог не попасть в target.

```swift
guard let startWordsURL = Bundle.main.url(forResource: "start", withExtension: "txt") else {
    fatalError("Не найден start.txt")
}
let startWords = try String(contentsOf: startWordsURL, encoding: .utf8)
let allWords = startWords.components(separatedBy: "\n")
rootWord = allWords.randomElement() ?? "silkworm"
```

Для обязательного встроенного ресурса `fatalError` уместен во время разработки: отсутствие файла означает ошибку сборки приложения, а не пользовательский ввод.

## List строится из Array

```swift
List(usedWords, id: \.self) { word in
    HStack {
        Image(systemName: "\(word.count).circle")
        Text(word)
    }
}
```

`usedWords` — обычный Swift Array. SwiftUI наблюдает изменение state и обновляет `List`.

## Проверки как маленькие functions

Вместо одной огромной проверки создай `isOriginal`, `isPossible` и `isReal`. Каждая function отвечает на один вопрос, поэтому её легче проверить отдельно.

```swift
guard answer.count > 2 else { return wordError("Слишком короткое слово") }
guard isOriginal(word: answer) else { return wordError("Слово уже использовано") }
guard isPossible(word: answer) else { return wordError("Нет таких букв") }
guard isReal(word: answer) else { return wordError("Слово не найдено") }
```

<Challenge>
<template #task>Запрети ввод исходного слова, добавь подсчёт очков по длине и кнопку перезапуска игры.</template>
<template #knowledge>Strings, conditions, functions, Arrays и state.</template>
<template #hint1>Сравни `answer` с `rootWord` после приведения к lowercase.</template>
<template #hint2>Храни score в `@State` и прибавляй `answer.count` после успешной проверки.</template>
<template #solution>

```swift
guard answer != rootWord else { return wordError("Нужно составить другое слово") }
score += answer.count
usedWords.insert(answer, at: 0)
```

</template>
</Challenge>

<ProjectRecap slug="project-05-word-scramble" />

Дальше интерфейс начнёт двигаться: [Project 6 — Animations →](/projects/project-06-animations).
