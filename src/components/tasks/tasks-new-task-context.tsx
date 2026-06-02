import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { TaskNewTaskBrainstormFlow } from "@/components/tasks/task-new-task-brainstorm-flow";

/** Abre o formulário “Nova tarefa” registado pela vista atual (quadro ou lista “Todas”). */
type TasksNewTaskHeaderContextValue = {
  /** Inicia o fluxo (brainstorming → nota → metas) ou falha se nenhuma vista registou o criar. */
  triggerNewTaskFromHeader: () => boolean;
  /** Igual a `triggerNewTaskFromHeader` — para efeitos de rota (`?newTask=true`). */
  beginNewTaskFlow: () => boolean;
  /** Vista ativa expõe a abertura do diálogo criar/editar em modo criar limpo. */
  registerOpenNewTask: (handler: () => void) => () => void;
};

const TasksNewTaskHeaderContext = createContext<TasksNewTaskHeaderContextValue | null>(null);

export function TasksNewTaskHeaderProvider({ children }: { children: ReactNode }) {
  const openerRef = useRef<(() => void) | null>(null);
  const [brainstormOpen, setBrainstormOpen] = useState(false);

  const registerOpenNewTask = useCallback((handler: () => void) => {
    openerRef.current = handler;
    return () => {
      if (openerRef.current === handler) openerRef.current = null;
    };
  }, []);

  const openRegisteredTaskCreate = useCallback(() => {
    openerRef.current?.();
  }, []);

  const beginNewTaskFlow = useCallback(() => {
    if (!openerRef.current) return false;
    setBrainstormOpen(true);
    return true;
  }, []);

  const value = useMemo(
    () => ({
      triggerNewTaskFromHeader: beginNewTaskFlow,
      beginNewTaskFlow,
      registerOpenNewTask,
    }),
    [beginNewTaskFlow, registerOpenNewTask],
  );

  return (
    <TasksNewTaskHeaderContext.Provider value={value}>
      <TaskNewTaskBrainstormFlow
        brainstormOpen={brainstormOpen}
        onBrainstormOpenChange={setBrainstormOpen}
        onOpenTaskCreate={openRegisteredTaskCreate}
      />
      {children}
    </TasksNewTaskHeaderContext.Provider>
  );
}

export function useTasksNewTaskHeader(): TasksNewTaskHeaderContextValue {
  const ctx = useContext(TasksNewTaskHeaderContext);
  if (!ctx) {
    throw new Error("useTasksNewTaskHeader must be used inside TasksNewTaskHeaderProvider");
  }
  return ctx;
}

/** Liga a página atual ao botão “Nova tarefa” do cabeçalho. */
export function useRegisterOpenNewTaskFromHeader(handler: () => void) {
  const { registerOpenNewTask } = useTasksNewTaskHeader();

  useEffect(() => registerOpenNewTask(handler), [registerOpenNewTask, handler]);
}
