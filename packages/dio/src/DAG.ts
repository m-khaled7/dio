import { DagError } from "./errors/dag.error.js";
import { IConnection, INodeData, NodeConnectionType } from "./interfaces/index.js";



export class DAG {
    private readonly nodes = new Map<string, INodeData>();
    private readonly outgoingByNode = new Map<string, IConnection[]>();
    private readonly incomingByNode = new Map<string, IConnection[]>();

    // ── Loading ────────────────────────────────────────────────────────────────

    load(nodes: INodeData[], connections: IConnection[]): this {
        for (const node of nodes) {
            if (this.nodes.has(node.id)) {
                throw new DagError(`Duplicate node "${node.id}" in input.`);
            }
            this.registerNode(node);
        }
        for (const conn of connections) {
            this.addEdge(conn);
        }
        return this;
    }

    // ── Query ──────────────────────────────────────────────────────────────────

    hasNode(id: string): boolean {
        return this.nodes.has(id);
    }

    getNode(id: string): INodeData {
        return this.requireNode(id);
    }

    getAllNodes(): INodeData[] {
        return [...this.nodes.values()];
    }

    nodeCount(): number {
        return this.nodes.size;
    }

    getNodeConnections(id: string, type?: NodeConnectionType): IConnection[] {
        this.requireNode(id);
        return this.outgoing(id, type);
    }

    getNodeIncomingConnections(id: string, type?: NodeConnectionType): IConnection[] {
        this.requireNode(id);
        const edges = this.incomingByNode.get(id) ?? [];
        return type ? edges.filter((e) => e.type === type) : edges;
    }

    getAllConnections(type?: NodeConnectionType): IConnection[] {
        const all: IConnection[] = [];
        for (const edges of this.outgoingByNode.values()) {
            for (const e of edges) {
                if (!type || e.type === type) all.push(e);
            }
        }
        return all;
    }

    getParents(nodeId: string, type?: NodeConnectionType): string[] {
        this.requireNode(nodeId);
        return this.incomingIds(nodeId, type);
    }

    getChildren(nodeId: string, type?: NodeConnectionType): string[] {
        this.requireNode(nodeId);
        return [...new Set(this.outgoing(nodeId, type).map((e) => e.targetNodeId))];
    }

    //bfs search
    getParentsRecursive(nodeId: string, type?: NodeConnectionType): string[] {
        this.requireNode(nodeId);
        const visited = new Set<string>();
        const queue = [nodeId];
        while (queue.length) {
            const cur = queue.shift()!;
            for (const id of this.incomingIds(cur, type)) {
                if (!visited.has(id)) {
                    visited.add(id);
                    queue.push(id);
                }
            }
        }
        return [...visited];
    }

    //bfs search
    getChildrenRecursive(nodeId: string, type?: NodeConnectionType): string[] {
        this.requireNode(nodeId);
        const visited = new Set<string>();
        const queue = [nodeId];
        while (queue.length) {
            const cur = queue.shift()!;
            for (const e of this.outgoing(cur, type)) {
                if (!visited.has(e.targetNodeId)) {
                    visited.add(e.targetNodeId);
                    queue.push(e.targetNodeId);
                }
            }
        }
        return [...visited];
    }

    getSiblings(nodeId: string, type?: NodeConnectionType): string[] {
        this.requireNode(nodeId);
        const siblings = new Set<string>();
        for (const parentId of this.incomingIds(nodeId, type)) {
            for (const e of this.outgoing(parentId, type)) {
                if (e.targetNodeId !== nodeId) siblings.add(e.targetNodeId);
            }
        }
        return [...siblings];
    }
    //nodes has no input connections
    getRoots(type?: NodeConnectionType): string[] {
        return [...this.nodes.keys()].filter((id) => this.incomingIds(id, type).length === 0);
    }

    // nodes has no output connections
    getLeaves(type?: NodeConnectionType): string[] {
        return [...this.nodes.keys()].filter((id) => this.outgoing(id, type).length === 0);
    }

    //get farest nodes that has no incoming connections 
    getHighestNodes(nodeId: string, type?: NodeConnectionType): string[] {
        this.requireNode(nodeId);
        const roots = new Set<string>();
        const visited = new Set<string>();
        const queue = [nodeId];
        while (queue.length) {
            const cur = queue.shift()!;
            if (visited.has(cur)) continue;
            visited.add(cur);
            const parents = this.incomingIds(cur, type);
            if (parents.length === 0) roots.add(cur);
            else queue.push(...parents);
        }
        return [...roots];
    }

    // ── DAG Level Ops ────────────

    isAncestorOf(nodeId: string, descendantId: string, type?: NodeConnectionType): boolean {
        return this.getChildrenRecursive(nodeId, type).some((id) => id === descendantId);
    }

    shortestPath(src: string, dst: string, type?: NodeConnectionType): string[] | null {
        this.requireNode(src);
        this.requireNode(dst);
        if (src === dst) return [src];
        const prev = new Map<string, string | null>([[src, null]]);
        const queue = [src];
        while (queue.length) {
            const cur = queue.shift()!;
            for (const e of this.outgoing(cur, type)) {
                if (!prev.has(e.targetNodeId)) {
                    prev.set(e.targetNodeId, cur);
                    if (e.targetNodeId === dst) {
                        const path: string[] = [];
                        let c: string | null = dst;
                        while (c !== null) {
                            path.unshift(c);
                            c = prev.get(c) ?? null;
                        }
                        return path;
                    }
                    queue.push(e.targetNodeId);
                }
            }
        }
        return null;
    }

    topologicalSort(type?: NodeConnectionType): INodeData[] {
        const inDegree = new Map<string, number>();
        for (const id of this.nodes.keys()) inDegree.set(id, 0);
        for (const id of this.nodes.keys()) {
            for (const e of this.outgoing(id, type)) {
                inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) ?? 0) + 1);
            }
        }
        const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
        const sorted: INodeData[] = [];
        while (queue.length) {
            const cur = queue.shift()!;
            sorted.push(this.nodes.get(cur)!);
            for (const e of this.outgoing(cur, type)) {
                const deg = (inDegree.get(e.targetNodeId) ?? 1) - 1;
                inDegree.set(e.targetNodeId, deg);
                if (deg === 0) queue.push(e.targetNodeId);
            }
        }
        if (sorted.length !== this.nodes.size && !type) {
            throw new DagError("Cycle detected during topological sort — graph is corrupted.");
        }
        return sorted;
    }

    // ── Mutation ───────────────────────────────────────────────────────────────

    addNode(node: INodeData, connections: IConnection[] = []): this {
        if (this.nodes.has(node.id)) {
            throw new DagError(`Node "${node.id}" already exists.`);
        }
        for (const conn of connections) {
            if (conn.targetNodeId === node.id) {
                throw new DagError(`Self-loop detected on node "${node.id}".`);
            }
            if (!this.nodes.has(conn.targetNodeId)) {
                throw new DagError(
                    `Cannot connect to unknown node "${conn.targetNodeId}". Add it first.`
                );
            }
        }
        this.registerNode(node);
        for (const conn of connections) {
            this.addEdge(conn);
        }
        return this;
    }

    updateNode(id: string, patch: Partial<Omit<INodeData, "id">>): this {
        const node = this.requireNode(id);
        this.nodes.set(id, { ...node, ...patch, id });
        return this;
    }

    removeNode(id: string): this {
        this.requireNode(id);

        // Remove all edges where this node is the source
        for (const conn of this.outgoingByNode.get(id) ?? []) {
            this.removeFromIndex(this.incomingByNode, conn.targetNodeId, conn);
        }

        // Remove all edges where this node is the target
        for (const conn of this.incomingByNode.get(id) ?? []) {
            this.removeFromIndex(this.outgoingByNode, conn.sourceNodeId, conn);
        }

        this.outgoingByNode.delete(id);
        this.incomingByNode.delete(id);
        this.nodes.delete(id);
        return this;
    }

    addEdge(conn: IConnection): this {
        const { sourceNodeId, targetNodeId } = conn;
        this.requireNode(sourceNodeId);
        this.requireNode(targetNodeId);

        if (sourceNodeId === targetNodeId) {
            throw new DagError(`Self-loop: "${sourceNodeId}" → "${targetNodeId}".`);
        }

        const cycle = this.findCycle(sourceNodeId, targetNodeId);
        if (cycle) {
            throw new DagError(
                `Edge "${sourceNodeId}" → "${targetNodeId}" would create a cycle: ${cycle.join(" → ")}`
            );
        }

        if (!this.isDuplicate(conn)) {
            this.outgoingByNode.get(sourceNodeId)!.push(conn);
            this.incomingByNode.get(targetNodeId)!.push(conn);
        }

        return this;
    }

    removeEdge(conn: IConnection): this {
        const edge = (this.outgoingByNode.get(conn.sourceNodeId) ?? []).find(
            (e) =>
                e.sourcePort === conn.sourcePort &&
                e.targetNodeId === conn.targetNodeId &&
                e.targetPort === conn.targetPort &&
                e.type === conn.type
        );
        if (!edge) return this;

        this.removeFromIndex(this.outgoingByNode, conn.sourceNodeId, edge);
        this.removeFromIndex(this.incomingByNode, conn.targetNodeId, edge);
        return this;
    }

    removeAllEdgesBetween(sourceNodeId: string, targetNodeId: string): this {
        const toRemove = (this.outgoingByNode.get(sourceNodeId) ?? []).filter(
            (e) => e.targetNodeId === targetNodeId
        );
        for (const edge of toRemove) {
            this.removeFromIndex(this.outgoingByNode, sourceNodeId, edge);
            this.removeFromIndex(this.incomingByNode, targetNodeId, edge);
        }
        return this;
    }

    // ── Private Helpers ────────────────────────────────────────────────────────

    private registerNode(node: INodeData): void {
        this.nodes.set(node.id, node);
        this.outgoingByNode.set(node.id, []);
        this.incomingByNode.set(node.id, []);
    }

    private requireNode(id: string): INodeData {
        const n = this.nodes.get(id);
        if (!n) throw new DagError(`Node "${id}" not found.`);
        return n;
    }

    private outgoing(nodeId: string, type?: NodeConnectionType): IConnection[] {
        const edges = this.outgoingByNode.get(nodeId) ?? [];
        return type ? edges.filter((e) => e.type === type) : edges;
    }

    private incomingIds(nodeId: string, type?: NodeConnectionType): string[] {
        const edges = this.incomingByNode.get(nodeId) ?? [];
        const filtered = type ? edges.filter((e) => e.type === type) : edges;
        return [...new Set(filtered.map((e) => e.sourceNodeId))];
    }

    private isDuplicate(conn: IConnection): boolean {
        return (this.outgoingByNode.get(conn.sourceNodeId) ?? []).some(
            (e) =>
                e.sourcePort === conn.sourcePort &&
                e.targetNodeId === conn.targetNodeId &&
                e.targetPort === conn.targetPort &&
                e.type === conn.type
        );
    }

    private removeFromIndex(
        index: Map<string, IConnection[]>,
        key: string,
        edge: IConnection
    ): void {
        const bucket = index.get(key);
        if (!bucket) return;
        const i = bucket.indexOf(edge);
        if (i !== -1) bucket.splice(i, 1);
    }

    private findCycle(src: string, dst: string): string[] | null {
        const visited = new Set<string>();
        const stack = [dst];
        while (stack.length) {
            const current = stack.pop()!;
            if (current === src) return this.tracePath(dst, src).concat(src);
            if (visited.has(current)) continue;
            visited.add(current);
            for (const e of this.outgoing(current)) stack.push(e.targetNodeId);
        }
        return null;
    }

    private tracePath(start: string, end: string): string[] {
        const prev = new Map<string, string | null>([[start, null]]);
        const queue = [start];
        while (queue.length) {
            const cur = queue.shift()!;
            for (const e of this.outgoing(cur)) {
                if (!prev.has(e.targetNodeId)) {
                    prev.set(e.targetNodeId, cur);
                    if (e.targetNodeId === end) {
                        const path: string[] = [];
                        let c: string | null = end;
                        while (c !== null) {
                            path.unshift(c);
                            c = prev.get(c) ?? null;
                        }
                        return path;
                    }
                    queue.push(e.targetNodeId);
                }
            }
        }
        return [start, end];
    }
}