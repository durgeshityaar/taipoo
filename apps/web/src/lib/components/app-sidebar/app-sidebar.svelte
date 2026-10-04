<script lang="ts">
    import logo from "$lib/assets/taipoo_logo.svg";
    import type { ComponentProps } from "svelte";
    import { page } from "$app/state";
    import { createForm } from "$lib/form-actions";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { workspace } from "$lib/workspace";
    import UserMenu from "./user-menu.svelte";
    import WorkspaceSwitcher from "./workspace-switcher.svelte";
    import WorkspacesNav from "./workspaces-nav.svelte";

    let {
        ref = $bindable(null),
        user,
        forms,
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> & {
        user: { name: string; email: string; image?: string | null };
        forms: { id: string; title: string; slug: string; publishedVersionId: string | null }[];
    } = $props();

    const workspaces = $derived([
        {
            name: workspace.name,
            open: true,
            forms,
        },
    ]);

</script>

<Sidebar.Root bind:ref class="border-e-0" {...restProps}>
    <Sidebar.Header>
        <WorkspaceSwitcher workspaces={[workspace]} />
    </Sidebar.Header>
    <Sidebar.Content>
        <Sidebar.Group class="pb-0">
            <Sidebar.Menu>
                <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive={page.url.pathname === "/dashboard"}>
                        {#snippet child({ props })}
                            <a href="/dashboard" {...props}><img src={logo} alt="" class="size-4" /><span>Home</span></a>
                        {/snippet}
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            </Sidebar.Menu>
        </Sidebar.Group>
        <WorkspacesNav {workspaces} oncreate={createForm} />
    </Sidebar.Content>
    <Sidebar.Footer>
        <UserMenu {user} />
    </Sidebar.Footer>
    <Sidebar.Rail />
</Sidebar.Root>
