---
title: День 3 — Сложные типы данных, часть 1
description: Arrays, Dictionaries, Sets и enums — способы объединять данные.
---

<TheoryApplications concept="arrays" :limit="3" />

# День 3 — Сложные типы данных, часть 1

Одна переменная хранит одно значение. Коллекции позволяют работать сразу с группой: списком задач, настройками пользователя или уникальными тегами.

## Arrays

**Array (массив)** хранит упорядоченные элементы одного типа. Порядок сохраняется, дубликаты разрешены.

```swift
var languages = ["Swift", "Kotlin", "Python"]

print(languages[0]) // Swift
languages.append("Rust")
languages.remove(at: 1)
print(languages.count)
```

Индекс начинается с нуля. Обращение к несуществующему индексу приводит к runtime error, поэтому не подставляйте непроверенное число.

```swift
let firstLanguage = languages.first
```

`first` безопаснее: оно возвращает optional, потому что массив может быть пустым. Optionals подробно разберём в Day 14.

Полезные операции:

```swift
let scores = [12, 8, 25, 8]

print(scores.contains(25))
print(scores.sorted())
print(scores.reversed())
```

## Dictionaries

**Dictionary (словарь)** хранит пары «ключ — значение». Элемент ищется по ключу, а не по позиции.

```swift
var user = [
    "name": "Лена",
    "city": "Казань"
]

print(user["name", default: "Неизвестно"])
user["city"] = "Самара"
user["role"] = "iOS developer"
```

Ключи уникальны. Повторное присваивание по тому же ключу заменяет значение.

Обращение `user["name"]` возвращает optional: такого ключа может не быть. Если отсутствие можно заменить разумным значением, используйте `default:`.

```swift
let points = ["Аня": 10, "Борис": 7]
print(points["Вера", default: 0]) // 0
```

## Sets

**Set (множество)** хранит уникальные элементы без фиксированного порядка. Оно удобно, когда важны принадлежность и отсутствие повторов.

```swift
var tags: Set<String> = ["swift", "ios", "swift"]
tags.insert("swiftui")

print(tags.count) // 3
print(tags.contains("ios"))
```

Проверка `contains` у `Set` обычно эффективнее, чем последовательный поиск по большому Array. Но если важны порядок или повторения, выбирайте Array.

| Коллекция | Порядок | Дубликаты | Доступ |
| --- | --- | --- | --- |
| Array | Да | Да | По индексу |
| Dictionary | Нет гарантированного | Ключи — нет | По ключу |
| Set | Нет гарантированного | Нет | По значению |

## Создание пустых коллекций

У пустой коллекции нет элементов, по которым компилятор мог бы вывести тип. Поэтому тип нужно указать.

```swift
var names = [String]()
var scores = [String: Int]()
var visited = Set<String>()
```

После этого Swift разрешит добавлять только подходящие значения.

## enums

`enum` описывает ограниченный набор допустимых вариантов. Вместо строки с возможной опечаткой мы получаем тип, который проверяет компилятор.

```swift
enum Direction {
    case north
    case south
    case east
    case west
}

var route = Direction.north
route = .east
```

После того как тип известен, Swift разрешает короткую запись `.east`.

### Associated values

Каждый вариант enum может нести связанные данные.

```swift
enum Result {
    case success(message: String)
    case failure(code: Int)
}

let download = Result.success(message: "Файл загружен")
```

### Raw values

Raw value заранее связывает каждый case с простым постоянным значением.

```swift
enum Weekday: Int {
    case monday = 1
    case tuesday
    case wednesday
    case thursday
    case friday
}

print(Weekday.wednesday.rawValue) // 3
```

Swift автоматически продолжает последовательность `Int`. Для строк raw value по умолчанию совпадает с именем case.

::: warning Частая ошибка
Array и Set решают разные задачи. Не меняйте Array на Set только ради удаления повторов, если дальше вам нужен исходный порядок элементов.
:::

## Безопасный доступ и `Hashable`

`array[index]` завершит программу, если index вне границ. Когда первый элемент может отсутствовать, используйте `array.first`; при обходе предпочитайте сам Array ручному `0..<array.count`.

Dictionary lookup возвращает optional, а default-subscript позволяет сразу получить запасное значение:

```swift
var visits = ["home": 2]
visits["profile", default: 0] += 1
```

Элементы Set и ключи Dictionary должны быть `Hashable`: Swift использует hash для быстрого поиска.
