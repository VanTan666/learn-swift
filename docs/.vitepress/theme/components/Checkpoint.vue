<template>
  <section class="checkpoint">
    <header>
      <span aria-hidden="true">⌁</span>
      <div><small>Практика</small><h2>Checkpoint</h2></div>
    </header>
    <div class="checkpoint-section">
      <h3>Условие</h3>
      <slot name="task" />
    </div>
    <div class="checkpoint-section">
      <h3>Что нужно знать</h3>
      <slot name="knowledge" />
    </div>
    <details>
      <summary>Показать подсказку</summary>
      <div class="checkpoint-reveal"><slot name="hint" /></div>
    </details>
    <details>
      <summary>Показать решение</summary>
      <div class="checkpoint-reveal"><slot name="solution" /></div>
    </details>
  </section>
</template>
