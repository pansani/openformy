# Form Builder UI Inspiration

## Overview
This document captures UI/UX inspiration for the OpenForm form builder interface.

## Layout Structure

### Three-Panel Layout
The form builder uses a clean three-panel layout:

1. **Left Panel: Field Library** (~300px width)
   - Search bar at top for filtering fields
   - Categorized field types with icons
   - Drag-and-drop field items

2. **Center Panel: Form Preview**
   - Live preview of the form being built
   - Shows form title ("Demo Form")
   - Shows form description ("Try building a form!")
   - Empty state with icon when no fields added
   - "Add Field" button at bottom
   - Helper text: "Add fields from the left panel to start building your form"

3. **Right Panel: Field Settings**
   - Shows "No field selected" state when nothing is selected
   - Helper text: "Click on a field in the preview to edit its settings"
   - Tabs for "Logic Rules" and "Field Logic"
   - Logic Items section with "Show Logic JSON" and "Add Logic" buttons
   - Empty state: "No logic items yet."

## Field Categories

### Input Fields
- **Text Input** - A single line for short text responses (icon: T)
- **Email** - Collect a valid email address (icon: envelope)
- **Number** - Input for numeric values (icon: #)
- **Phone Number** - Input for phone numbers with validation (icon: phone)
- **Textarea** - A multi-line field for longer text (icon: text box)
- **Date** - Pick a date from a calendar (icon: calendar)
- **Time** - Select or enter a time value (icon: clock)
- **Address** - Input for street, city, and other address details (icon: location pin)
- **Link** - Input for a valid website URL (icon: link)

### Selection Fields
- **Select Dropdown** - Dropdown to choose one option (icon: chevron down)
- **Radio Buttons** - Pick a single option from a list (icon: radio)
- **Checkboxes** - Select one or more options (icon: checkbox)
- **Slider** - Pick a value by sliding a handle (icon: slider)

## Design Patterns

### Visual Hierarchy
- Clean, minimal design with lots of whitespace
- Subtle borders and dividers
- Icon + text combination for field types
- Muted gray text for descriptions

### Empty States
- Centered icon placeholder
- Clear "No fields added yet" message
- Helpful instructions on what to do next
- Call-to-action button prominently displayed

### Interaction Patterns
- Drag-and-drop from field library to preview
- Click field in preview to edit settings
- Search/filter fields by typing
- Categorized fields for easy discovery

### Color Scheme
- Neutral background (light gray/white)
- Subtle borders and dividers
- Icons in gray/neutral tones
- Focus on content over decoration

## Key Features to Implement

1. **Field Library Panel**
   - Searchable field types
   - Category grouping (Input Fields, Selection Fields, etc.)
   - Icon + label + description format
   - Drag-and-drop capability

2. **Form Preview Panel**
   - Real-time preview as fields are added
   - Empty state with helpful guidance
   - Add field button
   - Form title and description editable inline

3. **Settings Panel**
   - Context-sensitive (shows settings for selected field)
   - Logic builder UI
   - Field properties editor
   - Validation rules configuration

4. **Logic Builder**
   - Visual logic rule builder
   - Show/hide fields based on conditions
   - JSON preview option for advanced users
   - Empty state when no logic defined

## Implementation Notes

### React Components Structure
```
FormBuilder/
  ├── FieldLibrary/
  │   ├── SearchBar
  │   ├── FieldCategory
  │   └── FieldItem (draggable)
  ├── FormPreview/
  │   ├── FormHeader (title, description)
  │   ├── FieldList (droppable)
  │   ├── EmptyState
  │   └── AddFieldButton
  └── FieldSettings/
      ├── FieldProperties
      ├── LogicBuilder
      └── EmptyState
```

### State Management
- Active form data (fields, settings)
- Selected field ID
- Drag-and-drop state
- Form configuration (title, description)
- Logic rules per field

### User Flow
1. User searches/browses field library
2. User drags field to preview or clicks "Add Field"
3. Field appears in preview
4. User clicks field to edit settings
5. Right panel shows field-specific settings
6. User can add logic rules, validation, etc.
7. Changes are reflected immediately in preview

## Future Enhancements
- Field reordering via drag-and-drop in preview
- Field duplication
- Field templates/presets
- Undo/redo functionality
- Keyboard shortcuts
- Responsive mobile view
