var HASH_MOD = 148;
var HASH_MULT = 121;

var keyword_hashtable =
[
 null
,null
,null
,null
,null
,null
,null
,{ id: "future", cat: FUTURE_CAT, enabled: true }
,null
,null
,{ id: "void", cat: VOID_CAT, enabled: true }
,{ id: "null", cat: NULL_CAT, enabled: true }
,null
,null
,{ id: "export", cat: EXPORT_CAT, enabled: true }
,{ id: "yield", cat: YIELD_CAT, enabled: true }
,null
,null
,null
,null
,{ id: "return", cat: RETURN_CAT, enabled: true }
,null
,null
,null
,{ id: "case", cat: CASE_CAT, enabled: true }
,{ id: "while", cat: WHILE_CAT, enabled: true }
,null
,null
,null
,{ id: "debugger", cat: DEBUGGER_CAT, enabled: true }
,{ id: "new", cat: NEW_CAT, enabled: true }
,null
,null
,{ id: "continue", cat: CONTINUE_CAT, enabled: true }
,null
,{ id: "private", cat: PRIVATE_CAT, enabled: true }
,null
,null
,{ id: "class", cat: CLASS_CAT, enabled: true }
,null
,null
,null
,null
,null
,null
,{ id: "var", cat: VAR_CAT, enabled: true }
,null
,{ id: "const", cat: CONST_CAT, enabled: true }
,null
,{ id: "let", cat: LET_CAT, enabled: true }
,null
,null
,null
,{ id: "else", cat: ELSE_CAT, enabled: true }
,null
,null
,null
,null
,null
,{ id: "try", cat: TRY_CAT, enabled: true }
,null
,{ id: "break", cat: BREAK_CAT, enabled: true }
,{ id: "function", cat: FUNCTION_CAT, enabled: true }
,null
,null
,null
,null
,null
,null
,null
,{ id: "switch", cat: SWITCH_CAT, enabled: true }
,{ id: "public", cat: PUBLIC_CAT, enabled: true }
,null
,null
,null
,{ id: "do", cat: DO_CAT, enabled: true }
,null
,null
,null
,{ id: "if", cat: IF_CAT, enabled: true }
,{ id: "with", cat: WITH_CAT, enabled: true }
,null
,null
,{ id: "finally", cat: FINALLY_CAT, enabled: true }
,null
,null
,null
,{ id: "in", cat: IN_CAT, enabled: true }
,null
,{ id: "default", cat: DEFAULT_CAT, enabled: true }
,null
,{ id: "catch", cat: CATCH_CAT, enabled: true }
,{ id: "throw", cat: THROW_CAT, enabled: true }
,null
,{ id: "implements", cat: IMPLEMENTS_CAT, enabled: true }
,{ id: "extends", cat: EXTENDS_CAT, enabled: true }
,{ id: "true", cat: TRUE_CAT, enabled: true }
,null
,{ id: "instanceof", cat: INSTANCEOF_CAT, enabled: true }
,null
,{ id: "this", cat: THIS_CAT, enabled: true }
,null
,null
,null
,null
,{ id: "interface", cat: INTERFACE_CAT, enabled: true }
,null
,{ id: "false", cat: FALSE_CAT, enabled: true }
,null
,null
,null
,null
,null
,null
,null
,null
,null
,{ id: "atomic", cat: ATOMIC_CAT, enabled: true }
,null
,{ id: "import", cat: IMPORT_CAT, enabled: true }
,null
,null
,null
,{ id: "super", cat: SUPER_CAT, enabled: true }
,{ id: "static", cat: STATIC_CAT, enabled: true }
,null
,null
,null
,null
,null
,{ id: "protected", cat: PROTECTED_CAT, enabled: true }
,{ id: "delete", cat: DELETE_CAT, enabled: true }
,{ id: "package", cat: PACKAGE_CAT, enabled: true }
,{ id: "enum", cat: ENUM_CAT, enabled: true }
,null
,null
,null
,null
,null
,{ id: "for", cat: FOR_CAT, enabled: true }
,null
,null
,null
,null
,null
,null
,null
,{ id: "typeof", cat: TYPEOF_CAT, enabled: true }
];
