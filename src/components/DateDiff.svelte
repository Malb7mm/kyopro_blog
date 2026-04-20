<script lang="ts">
  import { formatDistance } from "date-fns";
  import { ja } from "date-fns/locale";
  import { onMount } from "svelte";

  let { date }: { date: Date | string } = $props();
  let text = $state("-");

  onMount(() => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    text = formatDistance(dateObj, new Date(), {
      locale: ja,
      addSuffix: true,
    });
  });
</script>

<span>{text}</span>

