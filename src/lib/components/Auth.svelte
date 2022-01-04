<script>
  import supabase from "$lib/db";
  import { user } from "$lib/stores";
  import { onMount } from "svelte";

  let email = "test@email.com";
  let password = "DmzzGJDRxVmyrURMjKoi";

  const signIn = async () => {
    const credentials = { email, password };
    let { _, error } = await supabase.auth.signIn(credentials);
    if (error) {
      const response = await fetch("/sentencer");
      const { sentence: username, structure } = await response.json();
      await supabase.auth.signUp(credentials, {
        data: { username, structure },
      });
    }
  };

  const signOut = async () => await supabase.auth.signOut();

  const getUserProfile = async () => {
    const sessionUser = supabase.auth.user();
    if (sessionUser) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();
      $user = { ...sessionUser, ...userProfile };
    } else {
      $user = null;
    }
  };

  supabase.auth.onAuthStateChange(getUserProfile);
  onMount(getUserProfile);
</script>

{#if $user}
  <a href="/@{$user.username}">🧑‍🎨 your profile</a>
  <button on:click={signOut}>exit</button>
{:else}
  <button on:click={signIn}>enter</button>
{/if}
