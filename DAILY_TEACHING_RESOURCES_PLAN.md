# Simplified Daily Taught Material Upload & Resource Hub

## Overview
A streamlined, teacher-centric interface for uploading daily taught materials and viewing auto-generated Notes and Questions directly.

## 1. Upload Material Dialog Box (`UploadMaterialModal.tsx`)
A simple modal containing only the essential inputs:
- **Title**: Text input for the lesson title (e.g. *Newton's Second Law & Friction*).
- **Date**: Date picker for the teaching date.
- **Period Number**: Number input for the class period (e.g. *Period 1, 2, 3...*).
- **Taught Content / Summary**: Single multi-line `textarea` for what was taught in class.
- **File Attachment**: Option to attach PDF, Word docs, or text files (`.pdf`, `.doc`, `.docx`, `.txt`).

## 2. Displaying Uploaded Content UI (`ChapterResourcesPage.tsx`)
Each uploaded daily material entry is displayed cleanly in a card showing:
1. **Title** (bold heading)
2. **Period** (with period clock icon)
3. **Date** (calendar date)
4. **Two Action Icons**:
   - 📄 **Notes Icon**: Opens a popup displaying the AI-generated study notes for that lesson.
   - ❓ **Questions Icon**: Opens a popup displaying the AI-generated practice questions and answer key for that lesson.

## 3. Files Implemented
- [UploadMaterialModal.tsx](file:///media/sandy/New%20Volume/learning-matters/admins-frontend/src/pages/teacher/components/chapter-resources/UploadMaterialModal.tsx)
- [ChapterResourcesPage.tsx](file:///media/sandy/New%20Volume/learning-matters/admins-frontend/src/pages/teacher/ChapterResourcesPage.tsx)
