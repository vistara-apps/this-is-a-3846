import React, { useState } from 'react'
import { Copy, Edit3, Save, X } from 'lucide-react'

const ScriptEditor = ({ script, variant = 'viewOnly', onSave }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedScript, setEditedScript] = useState(script.content || '')

  const isEditable = variant === 'editable'

  const handleSave = () => {
    if (onSave) {
      onSave({ ...script, content: editedScript })
    }
    setIsEditing(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedScript)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">{script.title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy script"
          >
            <Copy className="w-4 h-4" />
          </button>
          {isEditable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Edit script"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedScript}
            onChange={(e) => setEditedScript(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={6}
            placeholder="Enter your script..."
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-zinc-600 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <p className="text-text leading-relaxed whitespace-pre-wrap">
            {editedScript || script.content}
          </p>
        </div>
      )}
    </div>
  )
}

export default ScriptEditor