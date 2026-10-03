<script lang="ts">
    import type { ComponentProps } from "svelte";
    import { toast } from "svelte-sonner";
    import { goto, invalidate } from "$app/navigation";
    import { api } from "$lib/api";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { formTitle, workspace } from "$lib/workspace";
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
        forms: { id: string; title: string }[];
    } = $props();

    const workspaces = $derived([
        {
            name: workspace.name,
            open: true,
            pages: forms.map((form) => ({ name: formTitle(form.title), url: `/forms/${form.id}/edit` })),
        },
    ]);

    // New blank, untitled form, then straight into its builder.
    async function createForm() {
        const res = await api().forms.$post({ json: {} });
        if (!res.ok) {
            toast.error("Couldn't create the form. Try again.");
            return;
        }
        const form = await res.json();
        await invalidate("app:forms");
        await goto(`/forms/${form.id}/edit`);
    }
</script>

<Sidebar.Root bind:ref class="border-e-0" {...restProps}>
    <Sidebar.Header>
        <WorkspaceSwitcher workspaces={[workspace]} />
    </Sidebar.Header>
    <Sidebar.Content>
        <WorkspacesNav {workspaces} oncreate={createForm} />
    </Sidebar.Content>
    <Sidebar.Footer>
        <UserMenu {user} />
    </Sidebar.Footer>
    <Sidebar.Rail />
</Sidebar.Root>
