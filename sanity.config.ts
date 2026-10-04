import {defineConfig, defineField, defineType} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

const criterion = defineType({
  name: 'criterion',
  title: 'Criterion',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'weight', title: 'Importance (1–5)', type: 'number', initialValue: 3, validation: (rule) => rule.required().min(1).max(5)}),
    defineField({name: 'description', title: 'What matters here?', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'name', subtitle: 'weight'}},
})

const option = defineType({
  name: 'option',
  title: 'Option',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'summary', title: 'One-line case for it', type: 'string'}),
    defineField({name: 'color', title: 'Accent color', type: 'string', options: {list: ['coral', 'blue', 'green', 'purple']}, initialValue: 'coral'}),
    defineField({name: 'scores', title: 'Scores', type: 'array', of: [{type: 'score'}], description: 'Add one score for each criterion. Enter the exact criterion name in each score.', validation: (rule) => rule.required().min(2)}),
  ],
  preview: {select: {title: 'name', subtitle: 'summary'}},
})

const score = defineType({
  name: 'score',
  title: 'Score',
  type: 'object',
  fields: [
    defineField({name: 'criterionKey', title: 'Criterion name', type: 'string', description: 'Use the exact name from the Criteria list.', validation: (rule) => rule.required()}),
    defineField({name: 'value', title: 'Score (1–5)', type: 'number', validation: (rule) => rule.required().min(1).max(5)}),
    defineField({name: 'note', title: 'Evidence / reasoning', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'criterionKey', subtitle: 'value'}},
})

const decision = defineType({
  name: 'decision',
  title: 'Decision',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Question', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Context', type: 'text', rows: 3}),
    defineField({name: 'category', title: 'Category', type: 'string', initialValue: 'Personal'}),
    defineField({name: 'criteria', title: 'Criteria', type: 'array', of: [{type: 'criterion'}], validation: (rule) => rule.required().min(2)}),
    defineField({name: 'options', title: 'Options', type: 'array', of: [{type: 'option'}], validation: (rule) => rule.required().min(2)}),
    defineField({name: 'updatedAt', title: 'Updated at', type: 'datetime'}),
  ],
  preview: {select: {title: 'title', subtitle: 'category'}},
})

export default defineConfig({
  name: 'decision-lab',
  title: 'Decision Lab',
  projectId: 'f2yoycw9',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: {types: [decision, criterion, option, score]},
})
