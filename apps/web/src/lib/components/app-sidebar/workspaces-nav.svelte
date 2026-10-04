<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { ComponentProps } from 'svelte';
	import FormRow from './form-row.svelte';

	// A workspace's `icon` is optional: it renders without one, and gains it once the data has it.
	// `any`: @lucide/svelte's icon types don't satisfy `Component` yet
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Icon = any;
	type Workspace = {
		name: string;
		icon?: Icon;
		open?: boolean;
		forms: ComponentProps<typeof FormRow>['form'][];
	};

	let { workspaces, oncreate }: { workspaces: Workspace[]; oncreate: (workspace: Workspace) => void } =
		$props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Workspaces</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each workspaces as workspace (workspace.name)}
				<Collapsible.Root open={workspace.open} class="group/collapsible">
					{#snippet child({ props })}
						<Sidebar.MenuItem {...props}>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuButton {...props}>
										<ChevronRightIcon
											class="text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
										/>
										{#if workspace.icon}
											<workspace.icon />
										{/if}
										<span>{workspace.name}</span>
									</Sidebar.MenuButton>
								{/snippet}
							</Collapsible.Trigger>
							<Sidebar.MenuAction showOnHover onclick={() => oncreate(workspace)}>
								<PlusIcon />
								<span class="sr-only">New form</span>
							</Sidebar.MenuAction>
							<Collapsible.Content>
								<Sidebar.MenuSub>
									{#each workspace.forms as form (form.id)}
										<FormRow {form} />
									{:else}
										<li class="px-2 py-1 text-caption text-muted-foreground">No forms yet</li>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						</Sidebar.MenuItem>
					{/snippet}
				</Collapsible.Root>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
