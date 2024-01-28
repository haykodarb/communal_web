<script lang="ts">
	import { supabase } from "$lib/supabase";
	import { onMount } from "svelte";

    onMount(async () => {
        supabase.storage.from('profile_avatars').download((await supabase.auth.getUser()).data.user?.user_metadata['username'])
    });
</script>

<div class="circle">
    Avatar
</div>

<style>
    .circle {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100px;
        width: 100px;
        border-radius: 50%;
        background-color: brown;
    }
</style>