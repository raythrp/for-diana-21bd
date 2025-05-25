// public/js/app.js

// To make this work without a build step, we import Vue and Confetti from a CDN.
import { createApp, ref, onMounted, onUnmounted, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/+esm';

createApp({
  setup() {
    // All your reactive variables and logic go here
    const isAfterMidnight = ref(false);
    const showForm = ref(false);
    const timerDisplay = ref('');
    const resolutions = ref(['']);
    const prayers = ref(['']);
    const showEmailMessage = ref(false);
    const isSending = ref(false);
    const emailStatusMessage = ref('');

    const birthday = new Date('May 26, 2025 00:00:00').getTime();
    let interval;

    const playConfetti = () => {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      function randomInRange(min, max) { return Math.random() * (max - min) + min; }
      const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(confettiInterval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    };

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = birthday - now;
      if (distance < 0) {
        isAfterMidnight.value = true;
        if (interval) clearInterval(interval);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerDisplay.value = `${(hours < 10 ? '0' : '')}${hours}h ${(minutes < 10 ? '0' : '')}${minutes}m ${(seconds < 10 ? '0' : '')}${seconds}s`;
      }
    };

    watch(isAfterMidnight, (isTime) => {
      if (isTime) {
        playConfetti();
        setTimeout(() => { showForm.value = true; }, 5000);
      }
    });

    onMounted(() => {
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    });

    onUnmounted(() => {
      if (interval) clearInterval(interval);
    });

    const addResolution = () => resolutions.value.push('');
    const addPrayer = () => prayers.value.push('');

    const submitWishesAndPrayers = async () => {
      const filledResolutions = resolutions.value.filter(res => res && res.trim() !== '');
      const filledPrayers = prayers.value.filter(prayer => prayer && prayer.trim() !== '');

      if (filledResolutions.length === 0 && filledPrayers.length === 0) {
        alert('Eits harus diisi semua dong! 😊');
        return;
      }

      isSending.value = true;
      showEmailMessage.value = false;
      const sherlysEmailAddress = 'medianathar@gmail.com';

      try {
        const response = await fetch('/send-wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resolutions: filledResolutions,
            prayers: filledPrayers,
            recipientEmail: sherlysEmailAddress,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'An unknown error occurred.');
        emailStatusMessage.value = "Cek email medianathar yaa. ❤️";
        showEmailMessage.value = true;
      } catch (error) {
        console.error('Failed to send wishes:', error);
        emailStatusMessage.value = `Oh no, something went wrong. Please show this to Rayhun: ${error.message}`;
        showEmailMessage.value = true;
      } finally {
        isSending.value = false;
        setTimeout(() => { showEmailMessage.value = false; }, 7000);
      }
    };

    // Return everything the HTML template needs to access
    return {
      isAfterMidnight,
      showForm,
      timerDisplay,
      resolutions,
      prayers,
      showEmailMessage,
      isSending,
      emailStatusMessage,
      addResolution,
      addPrayer,
      submitWishesAndPrayers,
    };
  }
}).mount('#app');