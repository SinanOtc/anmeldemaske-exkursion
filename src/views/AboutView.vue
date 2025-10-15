<template>
  <div class="about-page">
    <div class="about-card">
      <p class="about-label">Erstellt von</p>
      <h1 class="about-title">
        Vincenzo Scheibovic, Keviño Christiano Ronaldo del Albrán, Sigfried von Ottmeier
      </h1>
      <p class="about-subtitle">DHBW Exkursionsportal · Team 6: Die Optimierer</p>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
}

.about-card {
  width: min(680px, 100%);
  padding: 2.75rem 3rem;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    0 18px 45px rgba(17, 24, 39, 0.12),
    0 8px 18px rgba(17, 24, 39, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  text-align: center;
  backdrop-filter: blur(12px);
}

.about-label {
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(17, 24, 39, 0.55);
}

.about-title {
  margin: 0;
  font-weight: 700;
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  line-height: 1.35;
  color: #111827;
  letter-spacing: 0.01em;
}

.about-subtitle {
  margin: 0;
  font-size: 1rem;
  color: rgba(17, 24, 39, 0.68);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 600px) {
  .about-page {
    min-height: 60vh;
    padding: 2rem 1rem;
  }

  .about-card {
    padding: 2.25rem 1.75rem;
    gap: 1.1rem;
  }
}
</style>
