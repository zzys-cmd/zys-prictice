<template>
  <section class="hero-section">
    <div class="hero-inner">
      <div class="hero-text">
        <h1 class="hero-title">
          <span class="title-line-white">一次温暖的对话</span>
          <span class="title-line-yellow">化孤独为慰藉</span>
        </h1>
        <p class="hero-desc">
          每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连接温暖您的每一天
        </p>
        <div class="hero-buttons">
          <button class="btn-primary">开始倾诉，获得陪伴</button>
          <button class="btn-outline">记录心情，释放情感</button>
        </div>
      </div>
      <div class="hero-graphic">
        <div class="robot-circle">
          <img src="../assets/images/robot-fill.png" alt="robot" class="robot-fill" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.hero-section {
  flex: 1;
  background: linear-gradient(90deg, rgb(74, 156, 140) 0%, rgb(61, 138, 122) 100%);
  display: flex;
  align-items: center;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px;
  display: flex;
  align-items: center;
  gap: 80px;
}

.hero-text {
  flex: 1;

  .hero-title {
    margin-bottom: 24px;

    span {
      display: block;
    }

    .title-line-white {
      font-size: 42px;
      font-weight: 700;
      color: #fff;
      line-height: 1.3;
    }

    .title-line-yellow {
      font-size: 42px;
      font-weight: 700;
      color: #f5d742;
      line-height: 1.3;
    }
  }

  .hero-desc {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
    margin-bottom: 36px;
    max-width: 480px;
  }
}

.hero-buttons {
  display: flex;
  gap: 16px;

  .btn-primary {
    padding: 12px 32px;
    font-size: 15px;
    color: #555;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f0f0f0;
    }
  }

  .btn-outline {
    padding: 12px 32px;
    font-size: 15px;
    color: #fff;
    background: transparent;
    border: 1px solid #fff;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.hero-graphic {
  flex-shrink: 0;

  .robot-circle {
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: linear-gradient(90deg, rgb(74, 156, 140) 0%, rgb(61, 138, 122) 100%);
    border: 3px solid rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

    .robot-fill {
      width: 140px;
      height: 140px;
    }
  }
}

@media (max-width: 768px) {
  .hero-inner {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }

  .hero-text .hero-desc {
    max-width: 100%;
  }

  .hero-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
