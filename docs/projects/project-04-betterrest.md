---
title: Project 4 — BetterRest
description: DatePicker, Stepper и прогноз времени сна с Core ML.
projectSlug: project-04-betterrest
---

# Project 4 — BetterRest

BetterRest рекомендует время отхода ко сну по желаемому времени подъёма, продолжительности сна и количеству кофе. Мы соединим системные controls с обученной моделью Core ML.

<ProjectPrerequisites slug="project-04-betterrest" />

## Стартовая точка

Создай новый **iOS → App** с именем **BetterRest** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `BetterRestApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Время подъёма

**Цель:** Время подъёма.

**Попробуй сам:** Добавь Date в @State и DatePicker, редактирующий только часы и минуты. Помести в Form с заголовком BetterRest.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var wakeUp = Date.now
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            Form {
                DatePicker("Проснуться", selection: $wakeUp, displayedComponents: .hourAndMinute)
            }
            .navigationTitle("BetterRest")
        }
```


</details>

**Ожидаемый результат:** Дата не показывается, время можно менять. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `Date` хранит момент времени, `DatePicker` редактирует его через Binding. displayedComponents меняет только представление, не тип данных.

`selection: $wakeUp` работает так же, как binding поля суммы в WeSplit. `.hourAndMinute` — элемент набора компонентов, которые редактор должен показывать. Сам `Date` всё равно содержит дату: если отнять восемь часов от семи утра, результат окажется вечером предыдущего дня. Пока меняй время и проверяй, что контрол сохраняет выбор.

### Шаг 2. Желаемая продолжительность сна

**Цель:** Желаемая продолжительность сна.

**Попробуй сам:** Добавь Stepper для 4…12 часов с шагом 0.25.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var sleepAmount = 8.0
```

В **ContentView.swift** найди этот блок:

```swift
DatePicker("Проснуться", selection: $wakeUp, displayedComponents: .hourAndMinute)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
DatePicker("Проснуться", selection: $wakeUp, displayedComponents: .hourAndMinute)
                Stepper("Сон: \(sleepAmount.formatted()) ч", value: $sleepAmount, in: 4...12, step: 0.25)
```


</details>

**Ожидаемый результат:** Продолжительность меняется на четверть часа и не выходит за границы. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `Stepper` изменяет число дискретно. Подпись читает текущее значение, а value получает Binding: это тот же data flow, что у поля суммы.

Начальное значение 8.0 делает `sleepAmount` дробным. Поэтому `step: 0.25` означает 15 минут, а не 25 минут: четверть от 60. Интервал `4...12` включает обе границы. Кнопка уменьшения на нижней границе должна стать недоступной — это поведение уже обеспечивает Stepper.

### Шаг 3. Проверка расчёта без модели

**Цель:** Проверка расчёта без модели.

**Попробуй сам:** Вычти продолжительность сна из времени подъёма. Покажи отформатированное время отхода ко сну.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private var bedtime: String {
        wakeUp.addingTimeInterval(-sleepAmount * 3600)
            .formatted(date: .omitted, time: .shortened)
    }
```

В **ContentView.swift** найди этот блок:

```swift
            }
            .navigationTitle("BetterRest")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                Section("Лечь спать") { Text(bedtime).font(.title2.bold()) }
            }
            .navigationTitle("BetterRest")
```


</details>

**Ожидаемый результат:** Подъём 07:00 и восемь часов сна дают 23:00 предыдущего дня. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `addingTimeInterval` принимает секунды. Это проверка движения данных, не прогноз потребности во сне: модель подключим только после работающей формы.

Чтобы перейти от часов к секундам, умножаем на 3600. Отрицательный интервал переносит момент времени назад. `formatted(date: .omitted, time: .shortened)` скрывает дату только в подписи: сам расчёт по-прежнему работает с полным Date. Проверь отдельно 07:00/8 часов и 09:00/6 часов: должны получиться 23:00 и 03:00.

### Шаг 4. Подготовка входных данных

**Цель:** Подготовка входных данных.

**Попробуй сам:** Добавь Stepper количества кофе 1…20. В computed property получи секунды от полуночи из hour/minute выбранного wakeUp; временно покажи их в форме.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var coffeeAmount = 1
    private var wakeSeconds: Double {
        let components = Calendar.current.dateComponents([.hour, .minute], from: wakeUp)
        return Double((components.hour ?? 0) * 3600 + (components.minute ?? 0) * 60)
    }
```

В **ContentView.swift** найди этот блок:

```swift
Section("Лечь спать") { Text(bedtime).font(.title2.bold()) }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Stepper("Кофе: \(coffeeAmount)", value: $coffeeAmount, in: 1...20)
                Text("Секунд от полуночи: \(wakeSeconds.formatted())")
                Section("Лечь спать") { Text(bedtime).font(.title2.bold()) }
```


</details>

**Ожидаемый результат:** При 07:00 вход wakeSeconds равен 25200; кофе пока не влияет на простой расчёт. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `Calendar` извлекает компоненты в календаре пользователя. `.hour` и `.minute` optional, поэтому используем ?? 0; в модель передаём секунды, продолжительность в часах и число чашек.

`dateComponents([.hour, .minute], from: wakeUp)` просит только два компонента. Формула «часы × 3600 + минуты × 60» переводит их в число от полуночи, нужное модели. Чашки кофе вводятся целым числом, хотя модель далее будет принимать числовой Double. Пока изменение кофе не обязано менять простой результат — этот шаг проверяет входы.

### Шаг 5. Обучение и подключение Core ML

**Цель:** Обучение и подключение Core ML.

**Попробуй сам:** Скачай [SleepCalculator.csv](/data/SleepCalculator.csv), обучи Tabular Regression с target actualSleep. Подключи SleepCalculator.mlmodel к приложению. Код формы пока не меняй.

<details>
<summary>Показать решение шага 5</summary>

1. Открой **Xcode → Open Developer Tool → Create ML** и создай **Tabular Regression**.
2. Выбери скачанный CSV как Training Data, `actualSleep` как Target, `wake`, `estimatedSleep`, `coffee` как Features.
3. Нажми **Train**, затем экспортируй Output как **SleepCalculator.mlmodel**.
4. Перетащи модель в Project navigator, включи **Copy items if needed** и target membership приложения.
5. Выполни Build. Выбери модель в navigator и проверь сгенерированный интерфейс. Если тип не найден, проверь имя и target membership — не создавай подставной Swift-класс.
</details>

**Ожидаемый результат:** Build создаёт тип SleepCalculator; в интерфейсе модели доступны wake, estimatedSleep, coffee и actualSleep. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Create ML обучает модель, Core ML выполняет прогноз в приложении. Учебный CSV синтетический и нужен для воспроизводимого упражнения; его результаты не являются медицинскими рекомендациями.

Features — известные модели входные признаки, Target — величина, которую она учится предсказывать. В нашем CSV время подъёма и actualSleep записаны в секундах, estimatedSleep — в часах. Числа записаны с десятичной точкой, чтобы сгенерированный интерфейс принимал Double. Если раньше использовал старый CSV с целыми колонками, заново обучи и замени модель, иначе Xcode может ожидать Int64.

### Шаг 6. Прогноз и ошибка

**Цель:** Прогноз и ошибка.

**Попробуй сам:** Замени простую формулу вызовом модели. Удали временную строку секунд. При ошибке покажи понятный текст прямо в секции результата.

<details>
<summary>Показать решение шага 6</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import CoreML
```

В **ContentView.swift** найди этот блок:

```swift
wakeUp.addingTimeInterval(-sleepAmount * 3600)
            .formatted(date: .omitted, time: .shortened)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
do {
            let model = try SleepCalculator(configuration: MLModelConfiguration())
            let prediction = try model.prediction(
                wake: wakeSeconds, estimatedSleep: sleepAmount, coffee: Double(coffeeAmount)
            )
            return wakeUp.addingTimeInterval(-prediction.actualSleep)
                .formatted(date: .omitted, time: .shortened)
        } catch {
            return "Не удалось рассчитать время сна"
        }
```

В **ContentView.swift** найди этот блок:

```swift
                Text("Секунд от полуночи: \(wakeSeconds.formatted())")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift

```


</details>

**Ожидаемый результат:** Время пересчитывается по трём входам. При ошибке приложение показывает сообщение, а не завершается. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `try` отмечает операции, которые могут завершиться ошибкой. `do/catch` даёт два видимых результата. prediction.actualSleep приходит в секундах и вычитается из wakeUp.

`configuration` задаёт настройки выполнения модели, а `prediction(...)` принимает три подготовленных входа. Возвращается объект результата: `actualSleep` — его числовое свойство, а не готовое время на часах. Поэтому отнимаем его от выбранного момента подъёма. В случае ошибки возвращаем строку из catch, чтобы тип computed property оставался String в обеих ветках.

## Глубже — необязательно

::: details Advanced: стоимость прогнозирования
Для этого небольшого упражнения прогноз вычисляется при обновлении формы. В большом приложении отдельно изучи срок жизни модели и профилирование, прежде чем переносить работу между actors.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Установи время подъёма по умолчанию на 07:00 через Calendar. Проверь результат на новом запуске.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Вычисли стартовый Date в static property ContentView.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
static var defaultWakeTime: Date {
    Calendar.current.date(from: DateComponents(hour: 7)) ?? .now
}
// Замени начальное значение wakeUp:
@State private var wakeUp = defaultWakeTime
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
import CoreML


struct ContentView: View {
    @State private var wakeUp = Date.now

    @State private var sleepAmount = 8.0

    private var bedtime: String {
        do {
            let model = try SleepCalculator(configuration: MLModelConfiguration())
            let prediction = try model.prediction(
                wake: wakeSeconds, estimatedSleep: sleepAmount, coffee: Double(coffeeAmount)
            )
            return wakeUp.addingTimeInterval(-prediction.actualSleep)
                .formatted(date: .omitted, time: .shortened)
        } catch {
            return "Не удалось рассчитать время сна"
        }
    }

    @State private var coffeeAmount = 1
    private var wakeSeconds: Double {
        let components = Calendar.current.dateComponents([.hour, .minute], from: wakeUp)
        return Double((components.hour ?? 0) * 3600 + (components.minute ?? 0) * 60)
    }

    var body: some View {
        NavigationStack {
            Form {
                DatePicker("Проснуться", selection: $wakeUp, displayedComponents: .hourAndMinute)
                Stepper("Сон: \(sleepAmount.formatted()) ч", value: $sleepAmount, in: 4...12, step: 0.25)
                Stepper("Кофе: \(coffeeAmount)", value: $coffeeAmount, in: 1...20)
                Section("Лечь спать") { Text(bedtime).font(.title2.bold()) }
            }
            .navigationTitle("BetterRest")
        }
    }
}
```

### BetterRestApp.swift

```swift
import SwiftUI

@main
struct BetterRestApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

Также необходим `SleepCalculator.mlmodel`: создай его из [SleepCalculator.csv](/data/SleepCalculator.csv) по инструкции шага обучения. Xcode генерирует Swift-интерфейс модели при сборке; вручную его не копируй.

</details>

<ProjectRecap slug="project-04-betterrest" />

Следом применим Arrays, Strings и validation в игре [Word Scramble →](/projects/project-05-word-scramble).
