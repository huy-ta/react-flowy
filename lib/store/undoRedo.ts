export class UndoRedo<T> {
  stackLength: number;
  initialValue: T;
  undoStack: T[];
  redoStack: T[];

  constructor({ stackLength = 20, initialValue }: { stackLength: number, initialValue: T }) {
    this.stackLength = stackLength;
    this.initialValue = initialValue;
    this.undoStack = [this.initialValue];
    this.redoStack = [];
  }

  public getStack() {
    return { undoStack: this.undoStack, redoStack: this.redoStack };
  }

  public undo() {
    const undoValue = this.undoStack.pop();

    if (!undoValue) return;

    this.redoStack.push(undoValue);

    return undoValue;
  }

  public redo() {
    const redoValue = this.redoStack.pop();

    if (!redoValue) return;

    this.undoStack.push(redoValue);

    return redoValue;
  }

  public save(value: T) {
    this.undoStack.push(value);
  }
};
