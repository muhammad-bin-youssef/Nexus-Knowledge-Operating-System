use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NodeType {
    Question,
    Answer,
    Claim,
    Evidence,
    Argument,
    CounterArgument,
    Conclusion,
    Definition,
    Verse,
    Hadith,
    Scholar,
    Book,
    Article,
    Concept,
    Topic,
    Person,
    Place,
    Organization,
    Event,
    TimelineEvent,
    Custom,
}

impl NodeType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Question => "question",
            Self::Answer => "answer",
            Self::Claim => "claim",
            Self::Evidence => "evidence",
            Self::Argument => "argument",
            Self::CounterArgument => "counter_argument",
            Self::Conclusion => "conclusion",
            Self::Definition => "definition",
            Self::Verse => "verse",
            Self::Hadith => "hadith",
            Self::Scholar => "scholar",
            Self::Book => "book",
            Self::Article => "article",
            Self::Concept => "concept",
            Self::Topic => "topic",
            Self::Person => "person",
            Self::Place => "place",
            Self::Organization => "organization",
            Self::Event => "event",
            Self::TimelineEvent => "timeline_event",
            Self::Custom => "custom",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "question" => Some(Self::Question),
            "answer" => Some(Self::Answer),
            "claim" => Some(Self::Claim),
            "evidence" => Some(Self::Evidence),
            "argument" => Some(Self::Argument),
            "counter_argument" => Some(Self::CounterArgument),
            "conclusion" => Some(Self::Conclusion),
            "definition" => Some(Self::Definition),
            "verse" => Some(Self::Verse),
            "hadith" => Some(Self::Hadith),
            "scholar" => Some(Self::Scholar),
            "book" => Some(Self::Book),
            "article" => Some(Self::Article),
            "concept" => Some(Self::Concept),
            "topic" => Some(Self::Topic),
            "person" => Some(Self::Person),
            "place" => Some(Self::Place),
            "organization" => Some(Self::Organization),
            "event" => Some(Self::Event),
            "timeline_event" => Some(Self::TimelineEvent),
            "custom" => Some(Self::Custom),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EdgeType {
    Supports,
    Refutes,
    Answers,
    Asks,
    Defines,
    Mentions,
    Quotes,
    References,
    Contradicts,
    RelatedTo,
    SameEntity,
    SameTopic,
    Authenticates,
    DeclaresWeak,
    Summarizes,
    Expands,
    Contains,
    BelongsTo,
}

impl EdgeType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Supports => "supports",
            Self::Refutes => "refutes",
            Self::Answers => "answers",
            Self::Asks => "asks",
            Self::Defines => "defines",
            Self::Mentions => "mentions",
            Self::Quotes => "quotes",
            Self::References => "references",
            Self::Contradicts => "contradicts",
            Self::RelatedTo => "related_to",
            Self::SameEntity => "same_entity",
            Self::SameTopic => "same_topic",
            Self::Authenticates => "authenticates",
            Self::DeclaresWeak => "declares_weak",
            Self::Summarizes => "summarizes",
            Self::Expands => "expands",
            Self::Contains => "contains",
            Self::BelongsTo => "belongs_to",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "supports" => Some(Self::Supports),
            "refutes" => Some(Self::Refutes),
            "answers" => Some(Self::Answers),
            "asks" => Some(Self::Asks),
            "defines" => Some(Self::Defines),
            "mentions" => Some(Self::Mentions),
            "quotes" => Some(Self::Quotes),
            "references" => Some(Self::References),
            "contradicts" => Some(Self::Contradicts),
            "related_to" => Some(Self::RelatedTo),
            "same_entity" => Some(Self::SameEntity),
            "same_topic" => Some(Self::SameTopic),
            "authenticates" => Some(Self::Authenticates),
            "declares_weak" => Some(Self::DeclaresWeak),
            "summarizes" => Some(Self::Summarizes),
            "expands" => Some(Self::Expands),
            "contains" => Some(Self::Contains),
            "belongs_to" => Some(Self::BelongsTo),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Provenance {
    pub source_id: String,
    pub source_type: String,
    pub excerpt: Option<String>,
    pub offset_start: Option<i64>,
    pub offset_end: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: String,
    pub label: String,
    pub node_type: String,
    pub content: Option<String>,
    pub verified: bool,
    pub position_x: f64,
    pub position_y: f64,
    pub provenance: Provenance,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphEdge {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
    pub edge_type: String,
    pub evidence: String,
    pub verified: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphSnapshot {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub node_id: String,
    pub label: String,
    pub node_type: String,
    pub snippet: String,
    pub rank: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportResult {
    pub source_id: String,
    pub title: String,
    pub chunk_count: usize,
    pub nodes_created: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskInfo {
    pub id: String,
    pub name: String,
    pub status: String,
    pub progress: f64,
    pub message: Option<String>,
}
