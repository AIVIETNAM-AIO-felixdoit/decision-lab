---
title: Decision Lab: Making tradeoffs visible with Sanity
published: false
tags: devchallenge, sanitychallenge, sanity, ai
---

*This is a submission for the [Sanity Challenge, Path Two: Vibe-Code Something Strange](https://dev.to/challenges/sanity-2026-09-16).*

## What I Built

Decision Lab is a small workspace for choices that have no obvious winner. Instead of asking one question and returning a confident answer, it lets people describe the options, name the criteria that matter, assign scores, and then move the importance sliders to see whether their conclusion survives a change in priorities.

The demo compares two project ideas: **AI Study Planner** and **Portfolio Website**. The published Sanity content gives the former a higher learning score and the latter a much faster path to completion. With the initial weights, Portfolio Website leads **78% to 73%**. The interesting part is the what-if interaction: the answer can change when the user changes what matters most.

## Demo

**Live app:** [Decision Lab](https://decision-lab-sanity.netlify.app/)

The published **What should I build next?** decision is the Sanity-backed example in the sidebar. The screenshots below follow the built-in **Where should I work next?** example, which uses three options to show more of the comparison interface.

![Decision Lab overview showing Join a larger team as the front runner in a career decision](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/mpoisjtq4xnpkv7hbe0t.png)
*Overview: the current front runner and the three available paths.*

![Three career option cards with fit scores of 79, 78, and 71 percent above the priority sliders](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/wnp8ehxqkmwbfwsoz59f.png)
*At a glance: option scores and the sliders used to test different priorities.*

![Decision Lab side-by-side comparison showing criterion scores and reasoning for three career options](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/0chf3svkd9gmymw9jd17.png)
*Side by side: each option is scored against the same criteria.*

![Lower rows of the career comparison and interactive priority sliders](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/nsp5zv4z587lwv7e0btp.png)
*The rest of the breakdown, with weights that can be adjusted without editing published content.*

No login is needed to view the published decision. The app's **New decision** flow creates a local browser draft; published content is edited in Sanity Studio.

## Code

**Repository:** [Decision Lab source](https://github.com/AIVIETNAM-AIO-felixdoit/decision-lab)

The frontend is React, TypeScript, and Vite. Sanity Studio and the content schemas live in the same repository. The frontend queries published documents from the public Sanity dataset with GROQ. No API token is shipped to the browser.

## My Build Process

I built this with Codex as an iterative coding partner. We started with a narrow scope: one decision, several options, criteria with weights, and a side-by-side comparison. This avoided a generic dashboard full of unrelated features and made the structured content central to the experience.

The first pass used a local example so the interface and scoring could be tested before the Sanity project existed. Then I created a Sanity project, connected the Studio schema, added the frontend origin to CORS, and entered a real decision. The content model has a `decision` document containing `criteria` and `options`; each option has a score and optional reasoning for each criterion. The app calculates:

```text
fit = sum(score * criterion weight) / (5 * sum(criterion weight)) * 100
```

The first real publish revealed a useful failure: the document had options but no scores yet. The API returned `null` for the score arrays. I updated the query layer to normalize missing arrays, changed the interface to ask for scores instead of inventing a winner, and added Studio validation requiring scores. That was more valuable than a happy-path screenshot: it made the app honest about incomplete content.

We also caught a small CSS specificity issue during visual review. The initial letters in the comparison table's colored option marks were pushed away from the center by a generic table-header rule. A narrower rule fixed the alignment. Testing with real Sanity content and a human looking at the page found both issues.

The app deliberately keeps importance sliders as temporary what-if controls. Moving them recalculates the ranking instantly without changing the published decision. This separates the shared source data from an individual visitor's exploration.

## How I Used Sanity

Sanity holds the decision question, context, category, criteria, option summaries, colors, scores, and evidence notes as structured content. Studio is the editing interface; the frontend queries the published dataset and renders the same data in both the overview and comparison views. Editing and republishing a decision in Studio changes what visitors see without rebuilding the frontend.

**Sanity Project ID:** `f2yoycw9`

**Dataset:** `production` (public)

## What I Would Improve Next

The current frontend reads published Sanity content while its quick-create flow saves drafts locally. A future version could use Sanity's App SDK for authenticated editing and keep drafts in Content Lake. I would also add a richer way to link scores to criteria, so content editors do not have to type the exact criterion name.
