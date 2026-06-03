export type TableColumn<T> = {
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};
