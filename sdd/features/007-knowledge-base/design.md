# Technical Design — Knowledge Base (FEAT-007)

## Frontend Components

### 1. `KnowledgeBaseView.vue`
* Accessible via primary navigation headers.
* Contains a single search input bar.
* Input events must debounce by 300ms before calling the search API to avoid excessive database requests.
* Displays a list of matching resolved incident cards.

### 2. `ResolveIncidentModal.vue`
* Triggered when the status dropdown in `IncidentDetailView.vue` changes to `RESOLVED`.
* Overlays inputs for Root Cause and Applied Solution.
* The "Resolve" submit action remains disabled until both text areas are filled out.

---

## Backend Modules

### 1. Text Index Mapping
Update the `Incident` schema to define a compound text index:
```javascript
incidentSchema.index({
  description: 'text',
  rootCause: 'text',
  appliedSolution: 'text'
});
```

### 2. Search Controller
```javascript
const searchIncidents = async (req, res) => {
  const query = req.query.q;
  const results = await Incident.find(
    { $text: { $search: query }, status: 'RESOLVED' }
  );
  res.json(results);
};
```
