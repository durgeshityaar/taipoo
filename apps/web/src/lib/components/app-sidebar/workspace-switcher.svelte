<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';

	// `icon` is `any`: @lucide/svelte's icon types don't satisfy `Component` yet
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { workspaces }: { workspaces: { name: string; plan: string; icon: any }[] } = $props();
	const sidebar = useSidebar();

	// svelte-ignore state_referenced_locally
	let active = $state(workspaces[0]);
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div
							class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
						>
							<active.icon class="size-4" />
						</div>
						<div class="grid flex-1 text-start text-caption">
							<span class="truncate font-medium">{active.name}</span>
							<span class="truncate text-muted-foreground">{active.plan}</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				align="start"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-eyebrow text-muted-foreground">Workspaces</DropdownMenu.Label>
				{#each workspaces as workspace, index (workspace.name)}
					<DropdownMenu.Item onSelect={() => (active = workspace)} class="gap-2 p-2">
						<div class="flex size-6 items-center justify-center rounded-md border">
							<workspace.icon class="size-3.5 shrink-0" />
						</div>
						{workspace.name}
						<DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				{/each}
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="gap-2 p-2">
					<div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
						<PlusIcon class="size-4" />
					</div>
					<div class="font-medium text-muted-foreground">Add workspace</div>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
