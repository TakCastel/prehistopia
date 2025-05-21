import { defineStore } from "pinia";
import { ref } from "vue";

export const useAlertStore = defineStore("alert", () => {
  const alerts = ref([]);

  function push(type, message, duration = 5000) {
    const id = Date.now() + Math.random();
    const alert = { id, type, message };

    // max 3 alertes en file
    if (alerts.value.length >= 3) {
      alerts.value.shift();
    }

    alerts.value.push(alert);

    // disparition automatique
    setTimeout(() => remove(id), duration);
  }

  function remove(id) {
    const index = alerts.value.findIndex((a) => a.id === id);
    if (index !== -1) {
      alerts.value.splice(index, 1);
    }
  }

  return { alerts, push, remove };
});
