import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

/** Abre o formulário “Nova tarefa” registado pela vista atual (quadro ou lista “Todas”). */
type TasksNewTaskHeaderContextValue = {
  triggerNewTaskFromHeader: () => boolean;
  /** Vista ativa expõe a abertura do diálogo criar/editar em modo criar limpo. */
  registerOpenNewTask: (handler: () => void) => () => void;
};

const TasksNewTaskHeaderContext = createContext<TasksNewTaskHeaderContextValue | null>(null);

export function TasksNewTaskHeaderProvider({ children }: { children: ReactNode }) {
  const openerRef = useRef<(() => void) | null>(null);

  const registerOpenNewTask = useCallback((handler: () => void) => {
    openerRef.current = handler;
    return () => {
      if (openerRef.current === handler) openerRef.current = null;
    };
  }, []);

  const triggerNewTaskFromHeader = useCallback(() => {
    if (!openerRef.current) return false;
    openerRef.current();
    return true;
  }, []);

  const value = useMemo(
    () => ({
      triggerNewTaskFromHeader,
      registerOpenNewTask,
    }),
    [triggerNewTaskFromHeader, registerOpenNewTask],
  );

  return (
    <TasksNewTaskHeaderContext.Provider value={value}>{children}</TasksNewTaskHeaderContext.Provider>
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
