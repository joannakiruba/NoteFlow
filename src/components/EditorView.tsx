import { Textarea } from "@/components/ui/textarea"

interface EditorViewProps {
  value: string;
  onChange: (value: string) => void;
}

export const EditorView = ({ value, onChange }: EditorViewProps) => {
  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Input Notes</h2>
        <p className="text-sm text-muted-foreground">
          Use # for headings and - for bullet points.
        </p>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full p-4 font-mono text-sm resize-none"
        placeholder="# My Research\n- Point 1\n- Point 2 : Definition"
      />
    </div>
  )
}