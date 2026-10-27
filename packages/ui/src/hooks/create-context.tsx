import * as React from "react";

/* =================================================================================================
 * createContext: shared state for ONE compound component (Root + its parts)
 * ===============================================================================================*/

/**
 * Creates a context for a compound component; returns [Provider, useContext].
 * rootComponentName: for the Provider's DevTools name and the error message.
 * defaultContext: given → the context is optional (parts outside the root get the default);
 *                 omitted → required (reading it outside the root throws).
 */
function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType,
) {
  // a plain React context; with no Provider above, useContext returns defaultContext (maybe undefined)
  const Context = React.createContext<ContextValueType | undefined>(
    defaultContext,
  );

  /**
   * The value is passed as PROPS, not as one `value` object:
   *   <AutoDismissMessageProvider open={open} onClose={onClose}>
   * so the Provider can memoize the object itself and callers never need useMemo.
   */
  const Provider: React.FC<ContextValueType & { children: React.ReactNode }> = (
    props,
  ) => {
    // rest destructuring: `context` = every prop except children = the fields of the value
    const { children, ...context } = props;
    // `context` is a NEW object on every render, and every consumer re-renders when the value's
    // identity changes. useMemo hands back the PREVIOUS object unless one of the field VALUES
    // changed, so consumers re-render only when something they could read actually changed.
    // Deps = the field values. Valid because a component always passes the same set of props,
    // so the array keeps the same length every render (React requires that).
    const value = React.useMemo(
      () => context,
      // Only re-memoize when prop values change
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(context),
    ) as ContextValueType;
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  // React DevTools shows "AutoDismissMessageProvider" instead of an anonymous "Provider"
  Provider.displayName = rootComponentName + "Provider";

  /**
   * Reads the context. consumerName exists only for the error message:
   * "`AutoDismissMessageIcon` must be used within `AutoDismissMessage`".
   */
  function useContext(consumerName: string) {
    const context = React.useContext(Context);
    if (context) return context; // a Provider above, or a truthy default
    if (defaultContext !== undefined) return defaultContext; // a default that is falsy (null)
    throw new Error(
      `\`${consumerName}\` must be used within \`${rootComponentName}\``,
    );
  }

  // `as const`: a readonly tuple, so `const [A, B] = …` keeps each element's own type
  return [Provider, useContext] as const;
}

/* =================================================================================================
 * createContextScope: the same, plus PRIVATE COPIES for primitives built on top of this one
 * ===============================================================================================*/

// For each scope name, the list of React contexts to use instead of the shared ones,
// e.g. { Popper: [PopperContextCopyOwnedByPopover] }
type Scope<C = any> = { [scopeName: string]: React.Context<C>[] } | undefined;
// What useScope returns: ONE prop to spread onto the parts, e.g. { __scopePopper: {...} }
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };
// createScope is a function that also carries a `scopeName` property
interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

/**
 * Starts a FAMILY of contexts named scopeName ("Popover").
 * createContextScopeDeps: the createScope functions of primitives this one is built from
 * (Popover passes Popper's), so one scope prop can carry private copies for those too.
 * Returns [createContext (scope-aware), createScope].
 */
function createContextScope(
  scopeName: string,
  createContextScopeDeps: CreateScope[] = [],
) {
  // the default value of every context created in this family, in creation order;
  // createScope needs them later to build copies with the same defaults
  let defaultContexts: any[] = [];

  /** Like the createContext above, but Provider and useContext accept a `scope`. */
  function createContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType,
  ) {
    // the SHARED context, used whenever no scope is passed in
    const BaseContext = React.createContext<ContextValueType | undefined>(
      defaultContext,
    );
    // this context's position in the family; its copy in any scope sits at the same index
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];

    const Provider: React.FC<
      ContextValueType & {
        scope: Scope<ContextValueType>;
        children: React.ReactNode;
      }
    > = (props) => {
      // `scope` comes in as a prop: each part receives it as __scopePopover and passes it on
      const { scope, children, ...context } = props;
      // a private copy if this scope carries one for our family, otherwise the shared context
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = React.useMemo(
        () => context,
        // Only re-memoize when prop values change
        // eslint-disable-next-line react-hooks/exhaustive-deps
        Object.values(context),
      ) as ContextValueType;
      return <Context.Provider value={value}>{children}</Context.Provider>;
    };

    Provider.displayName = rootComponentName + "Provider";

    /** Must read from the SAME context object the Provider wrote to, so the lookup is identical. */
    function useContext(
      consumerName: string,
      scope: Scope<ContextValueType | undefined>,
    ) {
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = React.useContext(Context);
      if (context) return context;
      if (defaultContext !== undefined) return defaultContext;
      // if a defaultContext wasn't specified, it's a required context.
      throw new Error(
        `\`${consumerName}\` must be used within \`${rootComponentName}\``,
      );
    }

    return [Provider, useContext] as const;
  }

  /**
   * Called ONCE at module level by a primitive that USES this family
   * (popover.tsx runs `const usePopperScope = createPopperScope()`). It runs after the family's
   * module has finished all its createContext calls, so defaultContexts is complete.
   * Makes a fresh React context for each context in the family: copies only the caller's parts use.
   */
  const createScope: CreateScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) =>
      React.createContext(defaultContext),
    );

    /** Hook: returns the prop that tells this family's parts which contexts to use. */
    return function useScope(scope: Scope) {
      // an outer primitive already supplied copies for this family? keep them; else use ours
      const contexts = scope?.[scopeName] || scopeContexts;
      // { __scopePopper: { ...every scope passed in, Popper: contexts } }
      // memoized so the prop keeps its identity between renders
      return React.useMemo(
        () => ({
          [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts },
        }),
        [scope, contexts],
      );
    };
  };

  createScope.scopeName = scopeName;
  // the returned createScope also covers the dependencies (see below)
  return [
    createContext,
    composeContextScopes(createScope, ...createContextScopeDeps),
  ] as const;
}

/* =================================================================================================
 * composeContextScopes: several families' scopes → one prop
 * ===============================================================================================*/

/**
 * Merges createScope functions (this family's first, then its dependencies') into one.
 * Its hook returns ONE prop named after the first family, holding everyone's copies:
 *   { __scopePopover: { Popover: [...], Popper: [...] } }
 */
function composeContextScopes(
  ...scopes: [CreateScope, ...CreateScope[]]
): CreateScope {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope; // no dependencies: nothing to merge

  const createScope: CreateScope = () => {
    // call every family's createScope once: fresh private copies for each family
    const scopeHooks = scopes.map((createScope) => ({
      useScope: createScope(),
      scopeName: createScope.scopeName,
    }));

    return function useComposedScopes(overrideScopes) {
      // run each family's useScope and collect their { Name: contexts } entries into one object
      const nextScopes = scopeHooks.reduce(
        (nextScopes, { useScope, scopeName }) => {
          // a hook inside a callback breaks the usual rule, but scopeHooks never changes length
          // or order, so the hooks still run in the same order on every render
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scopeProps = useScope(overrideScopes);
          const currentScope = scopeProps[`__scope${scopeName}`];
          return { ...nextScopes, ...currentScope };
        },
        {},
      );

      return React.useMemo(
        () => ({ [`__scope${baseScope.scopeName}`]: nextScopes }),
        [nextScopes],
      );
    };
  };

  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

export { createContext, createContextScope };
export type { CreateScope, Scope };
