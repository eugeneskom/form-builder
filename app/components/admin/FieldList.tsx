import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  TextFields as TextFieldsIcon,
  Numbers as NumbersIcon,
  Subject as SubjectIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FormField } from '~/types';

const fieldIcons: Record<string, React.ReactNode> = {
  text: <TextFieldsIcon fontSize="small" />,
  number: <NumbersIcon fontSize="small" />,
  textarea: <SubjectIcon fontSize="small" />,
};

function SortableFieldItem({
  field,
  selected,
  onSelect,
  onDelete,
}: {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disablePadding
      sx={{ mb: 0.5 }}
    >
      <Paper
        onClick={onSelect}
        sx={{
          width: '100%',
          px: 1.5,
          py: 1,
          cursor: 'pointer',
          border: selected ? '1px solid' : '1px solid transparent',
          borderColor: selected ? 'primary.main' : 'transparent',
          bgcolor: selected ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          transition: 'all 0.15s',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <Box
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          sx={{ cursor: 'grab', color: 'text.disabled', display: 'flex' }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{fieldIcons[field.type]}</Box>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {field.options.label || `${field.type} field`}
          </Typography>
          <Chip label={field.type} size="small" sx={{ width: 'fit-content', height: 16, fontSize: 10 }} />
        </Stack>
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Paper>
    </ListItem>
  );
}

interface Props {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

export function FieldList({ fields, selectedId, onSelect, onReorder, onDelete }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(fields, oldIndex, newIndex);
      onReorder(reordered.map((f) => f.id));
    }
  }

  if (fields.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, color: 'text.disabled' }}>
        <Typography variant="body2">No fields yet</Typography>
        <Typography variant="caption">Click "Add" to get started</Typography>
      </Box>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <List disablePadding>
          {fields.map((field) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              selected={field.id === selectedId}
              onSelect={() => onSelect(field.id)}
              onDelete={() => onDelete(field.id)}
            />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  );
}
