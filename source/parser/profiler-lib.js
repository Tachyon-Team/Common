function profile$String_output_port()
{
    this.char_buffer = [];
    this.string_buffer = [];
}

profile$String_output_port.prototype.empty_char_buffer = function ()
{
    if (this.char_buffer.length > 0)
    {
        this.string_buffer.push(String.fromCharCode.apply(null, this.char_buffer));
        this.char_buffer = [];
    }
};

profile$String_output_port.prototype.write_char = function (c)
{
    this.char_buffer.push(c);
    if (this.char_buffer.length > 500)
        this.empty_char_buffer();
};

profile$String_output_port.prototype.write_string = function (str)
{
    for (var i=0; i<str.length; i++)
        this.write_char(str.charCodeAt(i));
};

profile$String_output_port.prototype.print = function (str)
{
    this.write_string(str + "\n");
};

profile$String_output_port.prototype.get_output_string = function ()
{
    this.empty_char_buffer();
    return String.prototype.concat.apply("", this.string_buffer);
};

function profile$print(str)
{
    profile$output.print(str);
}

var profile$output = new profile$String_output_port();

var profile$nesting = -1;
var profile$stack = [];
var profile$object_infos = [];
var profile$fn_abstypes = {};
var profile$prop_access_abstypes = {};
var profile$fetch_counter = 0;
var profile$store_counter = 0;
var profile$obj_counter = 0;
var profile$new_counter = 0;
var profile$map_counter = 0;
var profile$hit_counter = 0;
var profile$miss_counter = 0;
var profile$map_cache = {};
var profile$maps = [];

function profile$Map(len, props, maxindex)
{
    this.len = len;
    this.props = props;
    this.maxindex = maxindex;
    this.id = profile$map_counter++;
    profile$maps.push(this);
}

function profile$numify(obj)
{
    if (typeof obj === "string")
    {
        var n = Number(obj);
        if (n.toString() === obj)
            return n;
    }
    return obj;
}

function profile$map_to_string(map)
{
    var str = "";
    if (map.maxindex >= 0)
    {
        if (str !== "") str += ",";
        str += "0.." + map.maxindex;
    }
    for (var p in map.props)
    {
        p = profile$numify(p);
        if (!(map.props[p] instanceof profile$Map))
        {
            if (str !== "") str += ",";
            str += p;
        }
    }
    return "{" + str + "}";
}

var profile$map_root = new profile$Map(0, {}, -1);

function profile$clone(obj)
{
    if (obj === null || typeof obj !== "object")
        return obj;

    if (obj instanceof Array)
    {
        var copy = [];
        for (var i = 0; i < obj.length; ++i)
            copy[i] = profile$clone(obj[i]);
        return copy;
    }

    if (obj instanceof Object)
    {
        var copy = {};
        for (var attr in obj)
            if (obj.hasOwnProperty(attr))
                copy[attr] = profile$clone(obj[attr]);
        return copy;
    }

    error("Unsupported object type");
}

function profile$is_object(x)
{
    return (x !== null) &&
           (typeof x === "object" || typeof x === "function");
}

function profile$is_nonneg_int(x)
{
    return typeof x === "number" &&
           Math.floor(x) === x &&
           x >= 0;
}

function profile$copy_props(props)
{
    var newprops = {};
    for (var p in props)
    {
        p = profile$numify(p);
        if (!(props[p] instanceof profile$Map))
            newprops[p] = props[p];
    }
    return newprops;
}

function profile$map_extend(map, prop)
{
    prop = profile$numify(prop);
    if (profile$is_nonneg_int(prop)) /* && prop <= map.maxindex) */
        return map;
    else if (map.props.hasOwnProperty(prop))
    {
        if (!(map.props[prop] instanceof profile$Map))
            return map;
        else
            return map.props[prop];
    }
    else
    {
        var subprops = profile$copy_props(map.props);
        var submap;
        if (profile$is_nonneg_int(prop))
            submap = new profile$Map(map.len, subprops, prop);
        else
        {
            subprops[prop] = map.len;
            submap = new profile$Map(map.len+1, subprops, map.maxindex);
        }
        map.props[prop] = submap;
        return submap;
    }
}

function profile$object_map_init(obj)
{
    var map = profile$map_root;
    for (var p in obj)
        map = profile$map_extend(map, p);
    return map;
}

function profile$object_info_get(obj)
{
    var info;
    if (Object.isExtensible(obj))
    {
        info = { sn: profile$obj_counter++,
                 map: null
               };
        Object.defineProperty(obj,
                              "profile$info",
                              { value: info,
                                enumerable: false
                              });
    }
    else
    {
        for (var i=profile$object_infos.length-1; i>=0; i--)
        {
            if (profile$object_infos[i].obj === obj)
                return profile$object_infos[i].info;
        }
        info = { sn: profile$obj_counter++,
                 map: null
               };
        profile$object_infos.push({ obj: obj, info: info });
    }
    info.map = profile$object_map_init(obj);
    return info;
}

function profile$object_info(obj)
{
    var info;
    if (!obj.hasOwnProperty("profile$info"))
        info = profile$object_info_get(obj);
    else
        info = obj["profile$info"];
    return info;
}

function profile$get_tp_descr()
{
    return profile$fn_abstypes[profile$stack[profile$nesting]];
}

function profile$enter_tp(fn, args)
{
    var descr = profile$get_tp_descr();
    if (descr === undefined)
    {
        var loc = profile$stack[profile$nesting];
        descr = { loc: loc,
                  fn: fn,
                  calls: 0,
                  args: [],
                  result: undefined
                };
        profile$fn_abstypes[loc] = descr;
    }
    descr.calls++;
    for (var i=0; i<args.length; i++)
        descr.args[i] = profile$abstype_add(descr.args[i], args[i]);
}

function profile$return_tp(result)
{
    var descr = profile$get_tp_descr();
    descr.result = profile$abstype_add(descr.result, result);
}

function profile$absnum_add(absnum, val)
{
    if (absnum === undefined)
        absnum = { minnum: val,
                   maxnum: val
                 };
    else if (val < absnum.minnum)
        absnum.minnum = val;
    else if (val > absnum.maxnum)
        absnum.maxnum = val;
    return absnum;
}

function profile$absnum_to_string(absnum)
{
    if (absnum.minnum === absnum.maxnum)
        return "" + absnum.minnum;
    else
        return absnum.minnum + ".." + absnum.maxnum;
}

function profile$absbool_add(absbool, val)
{
    if (absbool === undefined)
        absbool = {};
    absbool[val] = true;
    return absbool;
}

function profile$absbool_to_string(absbool)
{
    var str = "";
    if (absbool[true] !== undefined)
    { if (str !== "") str += " U "; str += "true"; }
    if (absbool[false] !== undefined)
    { if (str !== "") str += " U "; str += "false"; }
    return str;
}

function profile$absobj_add(absobj, val)
{
    if (absobj === undefined)
        absobj = {};
    var info = profile$object_info(val);
    absobj[info.map.id] = true;
    return absobj;
}

function profile$absobj_to_string(absobj)
{
    var str = "";
    for (var x in absobj)
    { if (str !== "") str += " U "; str += "map[" + x + "]"; }
    return str;
}

function profile$abstype_add(abstype, val)
{
    if (abstype === undefined)
        abstype = { num: undefined,
                    str: undefined,
                    bool: undefined,
                    undef: undefined,
                    nul: undefined,
                    fn: undefined,
                    obj: undefined,
                    other: []
                  };

    if (profile$is_object(val))
        profile$object_info(val);

    if (typeof val === 'number')
        abstype.num = profile$absnum_add(abstype.num, val);
    else if (typeof val === 'string')
        abstype.str = profile$absnum_add(abstype.str, val.length);
    else if (typeof val === 'boolean')
        abstype.bool = profile$absbool_add(abstype.bool, val);
    else if (val === undefined)
        abstype.undef = true;
    else if (val === null)
        abstype.nul = true;
    else if (typeof val === 'function')
        abstype.fn = true;
    else if (profile$is_object(val))
        abstype.obj = profile$absobj_add(abstype.obj, val);
    else
        abstype.other.push(val);
    return abstype;
}

function profile$abstype_to_string(abstype)
{
    var str = "";
    if (abstype.num !== undefined)
    { if (str !== "") str += " U ";
      str += profile$absnum_to_string(abstype.num);
    }
    if (abstype.str !== undefined)
    { if (str !== "") str += " U ";
      str += "string[" + profile$absnum_to_string(abstype.str) + "]";
    }
    if (abstype.bool !== undefined)
    { if (str !== "") str += " U ";
      str += profile$absbool_to_string(abstype.bool);
    }
    if (abstype.undef !== undefined)
    { if (str !== "") str += " U ";
      str += "undefined";
    }
    if (abstype.nul !== undefined)
    { if (str !== "") str += " U ";
      str += "null";
    }
    if (abstype.fn !== undefined)
    { if (str !== "") str += " U ";
      str += "function";
    }
    if (abstype.obj !== undefined)
    { if (str !== "") str += " U ";
      str += profile$absobj_to_string(abstype.obj);
    }
    if (abstype.other.length > 0)
    { if (str !== "") str += " U ";
      str += abstype.other.join(" U ");
    }
    return str;
}

function profile$report()
{
    var fn_descrs = [];
    for (var loc in profile$fn_abstypes)
        fn_descrs.push(profile$fn_abstypes[loc]);
    fn_descrs.sort(function (x,y) { return (x.calls > y.calls) ? 1 : -1; });

    var prop_access_descrs = [];
    for (var loc in profile$prop_access_abstypes)
        prop_access_descrs.push(profile$prop_access_abstypes[loc]);
    prop_access_descrs.sort(function (x,y) { return (x.accesses > y.accesses) ? 1 : -1; });

    profile$output = new profile$String_output_port();

    profile$print("--------------------------- TYPE PROFILE");
    profile$print("fetch_counter = " + profile$fetch_counter);
    profile$print("store_counter = " + profile$store_counter);
    profile$print("obj_counter = " + profile$obj_counter);
    profile$print("new_counter = " + profile$new_counter);
    profile$print("map_counter = " + profile$map_counter);
    profile$print("hit_counter = " + profile$hit_counter);
    profile$print("miss_counter = " + profile$miss_counter);
    profile$print("");

    for (var i=0; i<profile$maps.length; i++)
    { var map = profile$maps[i];
      profile$print("map[" + map.id + "] = " + profile$map_to_string(map));
    }
    profile$print("");

    profile$print("FUNCTION PROFILE:");
    profile$print("");
    for (var j=0; j<fn_descrs.length; j++)
    { var descr = fn_descrs[j];
      profile$print(descr.calls + " " + descr.fn + " " + "(" + descr.loc + ":)");
      for (var i=0; i<descr.args.length; i++)
      {
          profile$print("     arg[" + i + "] = " +
                        profile$abstype_to_string(descr.args[i]));
      }
      profile$print("     result = " +
                    profile$abstype_to_string(descr.result));
      profile$print("");
    }

    profile$print("PROPERTY ACCESS RECEIVER PROFILE:");
    profile$print("");
    for (var j=0; j<prop_access_descrs.length; j++)
    { var descr = prop_access_descrs[j];
      profile$print(descr.accesses + " " + "(" + descr.loc + ":) " + profile$abstype_to_string(descr.abstype));
      profile$print("");
    }

    return profile$output.get_output_string();
}

function profile$nest(loc, enter, debug, fn)
{
    var level;
    if (enter)
    { level = ++profile$nesting;
      profile$stack[level] = loc;
    }
    else
        level = profile$nesting--;
    if (debug)
    {
        var prefix = "";
        if (level > 9) { prefix = "|["+level+"] "; level = 8; }
        while (level-- > 0) prefix = "|  " + prefix;
        profile$log(prefix+(enter?"((":"))")+" "+loc+": "+fn);
    }
}

function profile$enter(loc, profile, debug, fn, args)
{
    profile$nest(loc, true, debug, fn);
    if (profile)
        profile$enter_tp(fn, args);
}

function profile$return0(loc, profile, debug, fn)
{
    if (profile)
        profile$return_tp(undefined);
    profile$nest(loc, false, debug, fn)
}

function profile$return1(loc, profile, debug, fn, result)
{
    if (profile)
        profile$return_tp(result);
    profile$nest(loc, false, debug, fn)
    return result;
}

function profile$NewExpr_hook(loc, val)
{
    profile$new_counter++;
    return val;
}

function profile$CallExpr_hook(loc, val)
{
    return val;
}

function profile$FunctionExpr_hook(loc, val)
{
    return val;
}

function profile$Literal_hook(loc, val)
{
    return val;
}

function profile$ArrayLiteral_hook(loc, val)
{
    return val;
}

function profile$RegExpLiteral_hook(loc, val)
{
    return val;
}

function profile$ObjectLiteral_hook(loc, val)
{
    return val;
}

function profile$Ref_hook(loc, val)
{
    return val;
}

function profile$This_hook(loc, val)
{
    return val;
}

function profile$EvalExpr_hook(loc, val)
{
    return val;
}

function profile$instrument_hook(loc, expr)
{
    var options = { profile: true,
                    namespace: false,
                    exports: {},
                    debug: false,
                    warn: false,
                    ast: false,
                    nojs: false
                  };

    var port = new js2js$String_input_port(expr + "\n", "<eval at " + loc + ">");
    var s = new js2js$Scanner(port);
    var p = new js2js$Parser(s, options.warn);
    var prog = p.parse();
    var normalized_prog = js2js$ast_normalize(prog, options);

    return js2js$js_to_string(normalized_prog);
}

function profile$access_prop_tp(loc, obj)
{
    var descr = profile$prop_access_abstypes[loc];
    if (descr === undefined)
    { descr = { loc: loc,
                accesses: 0,
                abstype: undefined
              };
      profile$prop_access_abstypes[loc] = descr;
    }
    descr.accesses++;
    descr.abstype = profile$abstype_add(descr.abstype, obj);
}

function profile$fetch_store_prop(loc, obj, prop, val)
{
    profile$log(loc + " fetch/store " + (obj===window?"window":obj) + "." + prop + " = " + val);
    if (profile$is_object(obj))
    {
        profile$fetch_prop_aux(loc, obj, prop);
        profile$store_prop_aux(loc, obj, prop, val);
    }
}

function profile$fetch_prop(loc, obj, prop)
{
    profile$log(loc + " fetch " + (obj===window?"window":obj) + "." + prop);
    if (profile$is_object(obj))
        profile$fetch_prop_aux(loc, obj, prop);
}

function profile$store_prop(loc, obj, prop, val)
{
    profile$log(loc + " store " + (obj===window?"window":obj) + "." + prop + " = " + val);
    if (profile$is_object(obj))
        profile$store_prop_aux(loc, obj, prop, val);
}

function profile$fetch_prop_aux(loc, obj, prop)
{
    profile$fetch_counter++;
    profile$access_prop_tp(loc, obj);
    var info = profile$object_info(obj);
    if (profile$map_cache.hasOwnProperty(loc) &&
        profile$map_cache[loc].id === info.map.id)
        profile$hit_counter++;
    else
    { profile$miss_counter++;
      profile$map_cache[loc] = info.map;
    }
}

function profile$store_prop_aux(loc, obj, prop, val)
{
    profile$store_counter++;
    profile$access_prop_tp(loc, obj);
    var info = profile$object_info(obj);
    info.map = profile$map_extend(info.map, prop);
    if (profile$map_cache.hasOwnProperty(loc) &&
        profile$map_cache[loc].id === info.map.id)
    {
        profile$hit_counter++;
    }
    else
    {
        profile$miss_counter++;
        profile$map_cache[loc] = info.map;
    }
}

function profile$get_prop(loc, obj, prop)
{
    profile$fetch_prop(loc, obj, prop);
    return obj[prop];
}

function profile$put_prop_preinc(loc, obj, prop)
{
    var result = ++obj[prop];
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_predec(loc, obj, prop)
{
    var result = --obj[prop];
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_postinc(loc, obj, prop)
{
    var result = obj[prop]++;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_postdec(loc, obj, prop)
{
    var result = obj[prop]--;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop(loc, obj, prop, val)
{
    var result = obj[prop] = val;
    profile$store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_add(loc, obj, prop, val)
{
    var result = obj[prop] += val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_sub(loc, obj, prop, val)
{
    var result = obj[prop] -= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_mul(loc, obj, prop, val)
{
    var result = obj[prop] *= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_div(loc, obj, prop, val)
{
    var result = obj[prop] /= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_lsh(loc, obj, prop, val)
{
    var result = obj[prop] <<= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_rsh(loc, obj, prop, val)
{
    var result = obj[prop] >>= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_ursh(loc, obj, prop, val)
{
    var result = obj[prop] >>>= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_and(loc, obj, prop, val)
{
    var result = obj[prop] &= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_xor(loc, obj, prop, val)
{
    var result = obj[prop] ^= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_ior(loc, obj, prop, val)
{
    var result = obj[prop] |= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$put_prop_mod(loc, obj, prop, val)
{
    var result = obj[prop] %= val;
    profile$fetch_store_prop(loc, obj, prop, result);
    return result;
}

function profile$set_var_preinc(loc, val)
{
    return val;
}

function profile$set_var_predec(loc, val)
{
    return val;
}

function profile$set_var_postinc(loc, val)
{
    return val;
}

function profile$set_var_postdec(loc, val)
{
    return val;
}

function profile$set_var(loc, val)
{
    return val;
}

function profile$set_var_add(loc, val)
{
    return val;
}

function profile$set_var_sub(loc, val)
{
    return val;
}

function profile$set_var_mul(loc, val)
{
    return val;
}

function profile$set_var_div(loc, val)
{
    return val;
}

function profile$set_var_lsh(loc, val)
{
    return val;
}

function profile$set_var_rsh(loc, val)
{
    return val;
}

function profile$set_var_ursh(loc, val)
{
    return val;
}

function profile$set_var_and(loc, val)
{
    return val;
}

function profile$set_var_xor(loc, val)
{
    return val;
}

function profile$set_var_ior(loc, val)
{
    return val;
}

function profile$set_var_mod(loc, val)
{
    return val;
}

function profile$call_prop(loc, obj, prop)
{
    profile$log(loc + " call " + (obj===window?"window":obj) + "." + prop);
    if (profile$is_object(obj))
        profile$fetch_prop_aux(loc, obj, prop);
//    if (obj === undefined) {
//        console.log("Trying to access " + prop + " on undefined object");
//    } else if (((typeof obj === "object") || (typeof obj === "function")) && !(prop in obj)) {
//        console.log("Failed to find " + prop + " in " + (typeof obj) + " object " + obj);
//        for (var p in obj) {
//            console.log("  - " + p);
//        }
//    }
    var f = obj[prop];
    var args = [];
    for (var i=3; i<arguments.length; i++)
        args.push(arguments[i]);
    return f.apply(obj, args);
}

function profile$log(text)
{
    console.log(text);
}

function profile$send_output(text)
{
    var http = new XMLHttpRequest();
    http.open("POST", "profile_output", true);
    http.setRequestHeader("Content-type", "text/html");
    http.setRequestHeader("Content-length", text.length);
    http.setRequestHeader("Connection", "close");
    http.send(text);
}

function profile$dump()
{
    profile$send_output(profile$report());
//    print(profile$report());
}

//setTimeout(profile$dump, 5000); // dump after 5 seconds
