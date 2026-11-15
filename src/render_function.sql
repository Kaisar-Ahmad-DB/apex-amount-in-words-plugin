-- Amount In Words: Dynamic Action plug-in render function
-- Paste this into Plug-in > Source > PL/SQL Code (just the function, no CREATE statement).
-- Plug-in attribute mapping:
--   attribute_01 = Source Item           attribute_05 = Custom Major Unit (plural)
--   attribute_02 = Currency              attribute_06 = Custom Minor Unit (singular)
--   attribute_03 = Numbering System      attribute_07 = Custom Minor Unit (plural)
--   attribute_04 = Custom Major (sing.)  attribute_08 = Suffix Text

function render_amount_in_words
    ( p_dynamic_action in apex_plugin.t_dynamic_action
    , p_plugin         in apex_plugin.t_plugin )
    return apex_plugin.t_dynamic_action_render_result
is
    l_result apex_plugin.t_dynamic_action_render_result;
begin
    l_result.javascript_function :=
           'function(){ amountInWords.run(this, {'
        || apex_javascript.add_attribute(p_name => 'source',   p_value => p_dynamic_action.attribute_01, p_omit_null => false, p_add_comma => true)
        || apex_javascript.add_attribute(p_name => 'currency', p_value => nvl(p_dynamic_action.attribute_02, 'BDT'),  p_omit_null => false, p_add_comma => true)
        || apex_javascript.add_attribute(p_name => 'system',   p_value => nvl(p_dynamic_action.attribute_03, 'AUTO'), p_omit_null => false, p_add_comma => true)
        || apex_javascript.add_attribute(p_name => 'major1',   p_value => p_dynamic_action.attribute_04, p_omit_null => false, p_add_comma => true)
        || apex_javascript.add_attribute(p_name => 'major2',   p_value => p_dynamic_action.attribute_05, p_omit_null => false, p_add_comma => true)
        || apex_javascript.add_attribute(p_name => 'minor1',   p_value => p_dynamic_action.attribute_06, p_omit_null => false, p_add_comma => true)
        || apex_javascript.add_attribute(p_name => 'minor2',   p_value => p_dynamic_action.attribute_07, p_omit_null => false, p_add_comma => true)
        || apex_javascript.add_attribute(p_name => 'suffix',   p_value => p_dynamic_action.attribute_08, p_omit_null => false, p_add_comma => false)
        || '}); }';

    return l_result;
end render_amount_in_words;
