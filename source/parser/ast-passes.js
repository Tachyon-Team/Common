/* _________________________________________________________________________
 *
 *             Tachyon : A Self-Hosted JavaScript Virtual Machine
 *
 *
 *  This file is part of the Tachyon JavaScript project. Tachyon is
 *  distributed at:
 *  http://github.com/Tachyon-Team/Tachyon
 *
 *
 *  Copyright (c) 2011, Universite de Montreal
 *  All rights reserved.
 *
 *  This software is licensed under the following license (Modified BSD
 *  License):
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the Universite de Montreal nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
 *  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * _________________________________________________________________________
 */

//=============================================================================

// File: "ast-passes.js"

// Copyright (c) 2010-2011 by Marc Feeley, All Rights Reserved.

//=============================================================================

// Generic AST walker.

function ast_walk_statement(ast, ctx)
{
    if (ast instanceof Program)
    {
        ast.block = ctx.walk_statement(ast.block);
        return ast;
    }
    else if (ast instanceof FunctionDeclaration)
    {
        ast.funct = ctx.walk_expr(ast.funct);
        return ast;
    }
    else if (ast instanceof BlockStatement)
    {
        ast.statements = ast_walk_statements(ast.statements, ctx);
        return ast;
    }
    else if (ast instanceof VariableStatement)
    {
        ast.decls.forEach(function (decl, i, self)
                          {
                              decl.initializer = ctx.walk_expr(decl.initializer);
                          });
        return ast;
    }
    else if (ast instanceof ConstStatement)
    {
        // TODO
        error("ConstStatement not implemented");
        return ast;
    }
    else if (ast instanceof ExprStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof IfStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.statements = ast_walk_statements(ast.statements, ctx);
        return ast;
    }
    else if (ast instanceof DoWhileStatement)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof WhileStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForStatement)
    {
        ast.expr1 = ctx.walk_expr(ast.expr1);
        ast.expr2 = ctx.walk_expr(ast.expr2);
        ast.expr3 = ctx.walk_expr(ast.expr3);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForVarStatement)
    {
        for (var i=ast.decls.length-1; i>=0; i--)
        {
            var decl = ast.decls[i];
            decl.initializer = ctx.walk_expr(decl.initializer);
        }
        ast.expr2 = ctx.walk_expr(ast.expr2);
        ast.expr3 = ctx.walk_expr(ast.expr3);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForInStatement)
    {
        ast.lhs_expr = ctx.walk_expr(ast.lhs_expr);
        ast.set_expr = ctx.walk_expr(ast.set_expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForVarInStatement)
    {
        ast.initializer = ctx.walk_expr(ast.initializer);
        ast.set_expr = ctx.walk_expr(ast.set_expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ContinueStatement)
    {
        return ast;
    }
    else if (ast instanceof BreakStatement)
    {
        return ast;
    }
    else if (ast instanceof ReturnStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof WithStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof SwitchStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.clauses.forEach(function (c, i, asts)
                            {
                                c.expr = ctx.walk_expr(c.expr);
                                c.statements = ast_walk_statements(c.statements, ctx);
                            });
        return ast;
    }
    else if (ast instanceof LabelledStatement)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ThrowStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof TryStatement)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        ast.catch_part = ctx.walk_statement(ast.catch_part);
        ast.finally_part = ctx.walk_statement(ast.finally_part);
        return ast;
    }
    else if (ast instanceof CatchPart)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof DebuggerStatement)
    {
        return ast;
    }
    else if (ast instanceof AtomicStatement) /********* extensions *********/
    {
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof FutureStatement) /********* extensions *********/
    {
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast === null)
    {
        // no transformation
        return ast;
    }
    else
    {
        //pp(ast);
        error("unknown ast in walk_statement");
    }
}

function ast_walk_statements(asts, ctx)
{
    asts.forEach(function (ast, i, asts)
                 {
                     asts[i] = ctx.walk_statement(ast);
                 });
    return asts;
}

function ast_walk_expr(ast, ctx)
{
    if (ast instanceof OpExpr)
    {
        ast.exprs = ast_walk_exprs(ast.exprs, ctx);
        return ast;
    }
    else if (ast instanceof NewExpr)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.args = ast_walk_exprs(ast.args, ctx);
        return ast;
    }
    else if (ast instanceof CallExpr)
    {
        ast.fn = ctx.walk_expr(ast.fn);
        ast.args = ast_walk_exprs(ast.args, ctx);
        return ast;
    }
    else if (ast instanceof FunctionExpr)
    {
        ast.body = ast_walk_statements(ast.body, ctx);
        return ast;
    }
    else if (ast instanceof Literal)
    {
        return ast;
    }
    else if (ast instanceof ArrayLiteral)
    {
        ast.exprs = ast_walk_exprs(ast.exprs, ctx);
        return ast;
    }
    else if (ast instanceof RegExpLiteral)
    {
        return ast;
    }
    else if (ast instanceof ObjectLiteral)
    {
        ast.properties.forEach(function (prop, i, self)
                               {
                                   // name shouldn't be treated as an expression
                                   //prop.name = ctx.walk_expr(prop.name);
                                   prop.value = ctx.walk_expr(prop.value);
                               });
        return ast;
    }
    else if (ast instanceof Ref)
    {
        return ast;
    }
    else if (ast instanceof This)
    {
        return ast;
    }
    else if (ast === null)
    {
        // no transformation
        return ast;
    }
    else
    {
        //pp(ast);
        error("unknown ast in walk_expr");
    }
}

function ast_walk_exprs(asts, ctx)
{
    asts.forEach(function (ast, i, asts)
                 {
                     asts[i] = ctx.walk_expr(ast);
                 });
    return asts;
}

//-----------------------------------------------------------------------------

// Simplification pass.
//
// This pass determines the variables declared in each scope and
// transforms the AST into a simpler AST:
//
//   - transform VariableStatement into assignment
//   - transform ForVarStatement into ForStatement
//   - transform ForVarInStatement into ForInStatement
//   - flattening of nested block statements
//
// Variable declarations are made to refer to Variable objects.

function Variable(tok, is_param, is_declared, scope)
{
    this.tok         = tok;
    this.is_param    = is_param;
    this.is_declared = is_declared;
    this.scope       = scope;
    this.special     = false; // can be false, "eval" or "arguments"
}

Variable.prototype.toString = function ()
{
    return this.tok.toString();
};

function register_decl(scope, id, is_param)
{
    // This function adds the identifier id to the ast node scope.
    // The id is an instance of Token (with cat=IDENT_CAT) or Variable.
    // The scope is an instance of Program, FunctionExpr or CatchPart.

    var id_str = id.toString();
    var v = scope.vars[id_str];
    if (typeof v === "undefined")
    {
        v = new Variable((id instanceof Token) ? id : id.tok,
                         is_param,
                         true,
                         scope);
        scope.vars[id_str] = v;
    }
    return v;
};

function simplification_pass_ctx(options, scope)
{
    this.options = options;
    this.scope = scope;
    this.non_catch_scope = scope; // assume it is not a CatchPart scope
}

simplification_pass_ctx.prototype.create_ctx = function (ast)
{
    ast.vars = {};
    ast.parent = this.scope;
    return new simplification_pass_ctx(this.options, ast);
}

simplification_pass_ctx.prototype.walk_statement = function (ast)
{
    if (ast instanceof Program)
    {
        var new_ctx = this.create_ctx(ast);
        return ast_walk_statement(ast, new_ctx);
    }
    else if (ast instanceof FunctionDeclaration)
    {
        ast.id = register_decl(this.non_catch_scope, ast.id, false);
        ast.funct = this.walk_expr(ast.funct);
        return ast;
    }
    else if (ast instanceof VariableStatement)
    {
        var ctx = this;
        var accum = [];
        ast.decls.forEach(function (decl, i, self)
                          {
                              decl.id = register_decl(ctx.non_catch_scope, decl.id, false);
                              if (decl.initializer !== null)
                              {
                                  decl.initializer = ctx.walk_expr(decl.initializer);
                                  accum.push(new ExprStatement(
                                               decl.loc,
                                               new OpExpr(decl.loc,
                                                          op2_table[EQUAL_CAT],
                                                          [new Ref(decl.id.tok.loc,
                                                                   decl.id.tok),
                                                           decl.initializer])));
                              }
                          });
        if (accum.length === 1)
            return accum[0];
        else
            return new BlockStatement(ast.loc,
                                      accum);
    }
    else if (ast instanceof ForVarStatement)
    {
        var accum = null;
        for (var i=ast.decls.length-1; i>=0; i--)
        {
            var decl = ast.decls[i];
            decl.id = register_decl(this.non_catch_scope, decl.id, false);
            if (decl.initializer !== null)
            {
                decl.initializer = this.walk_expr(decl.initializer);
                var init = new OpExpr(decl.loc,
                                      op2_table[EQUAL_CAT],
                                      [new Ref(decl.id.tok.loc,
                                               decl.id.tok),
                                       decl.initializer]);
                if (accum === null)
                    accum = init;
                else
                    accum = new OpExpr(decl.loc,
                                       op2_table[COMMA_CAT],
                                       [init, accum]);
            }
        }
        ast.expr2 = this.walk_expr(ast.expr2);
        ast.expr3 = this.walk_expr(ast.expr3);
        ast.statement = this.walk_statement(ast.statement);
        return new ForStatement(ast.loc,
                                accum,
                                ast.expr2,
                                ast.expr3,
                                ast.statement);
    }
    else if (ast instanceof ForVarInStatement)
    {
        ast.id = register_decl(this.non_catch_scope, ast.id, false);
        var initializer = this.walk_expr(ast.initializer);
        var set_expr = this.walk_expr(ast.set_expr);
        var statement = this.walk_statement(ast.statement);
        var for_stat = new ForInStatement(ast.loc,
                                          new Ref(ast.id.tok.loc,
                                                  ast.id.tok),
                                          set_expr,
                                          statement);
        if (initializer === null)
            return for_stat;
        else
            return new BlockStatement(ast.loc,
                                      [new ExprStatement(
                                         initializer.loc,
                                         new OpExpr(ast.loc,
                                                    op2_table[EQUAL_CAT],
                                                    [new Ref(ast.id.tok.loc,
                                                             ast.id.tok),
                                                     initializer])),
                                       for_stat]);
    }
    else if (ast instanceof CatchPart)
    {
        var new_ctx = this.create_ctx(ast);
        new_ctx.non_catch_scope = this.non_catch_scope;
        ast.id = register_decl(ast, ast.id, true);
        return ast_walk_statement(ast, new_ctx);
    }
    else
        return ast_walk_statement(ast, this);
};

simplification_pass_ctx.prototype.walk_expr = function (ast)
{
    if (ast instanceof FunctionExpr)
    {
        var new_ctx = this.create_ctx(ast);

        ast.params.forEach(function (param, i, self)
                           {
                               ast.params[i] = register_decl(ast, param, true);
                           });

/*
        if (ast.id !== null)
            ast.id = register_decl(ast, ast.id, false); // TODO: verify that this conforms to ES5
*/

        return ast_walk_expr(ast, new_ctx);
    }
    else
        return ast_walk_expr(ast, this);
};

simplification_pass_ctx.prototype.walk_statements = function (asts)
{
    var ctx = this;
    var accum = [];
    asts.forEach(function (ast, i, asts)
                 {
                     var a = ctx.walk_statement(ast);
                     if (a instanceof BlockStatement)
                         accum.push(a.statements); // merge embedded blocks
                     else
                         accum.push([a]);
                 });
    return Array.prototype.concat.apply([], accum);
};

function simplification_pass(ast, options)
{
    var ctx = new simplification_pass_ctx(options, null);
    ctx.walk_statement(ast);
}

//-----------------------------------------------------------------------------

// Variable resolution pass.
//
// This pass resolves variable references according to their scope.
// It must follow the simplification pass which determines
// the set of variables declared in each scope.

function resolve_var(scope, id)
{
    var id_str = id.toString();

    while (true)
    {
        // Check if id is declared in the current scope

        var v = scope.vars[id_str];

        if (typeof v !== "undefined")
            return v;

        var parent = scope.parent;

        if (parent === null)
            break;

        scope = parent;
    }

    // Search has stopped at the global scope (a Program node)

    v = new Variable(id, false, false, scope);

    scope.vars[id_str] = v;

    return v;
}

function var_resolution_pass_ctx(options, scope)
{
    this.options = options;
    this.scope = scope;
    this.non_catch_scope = scope; // assume it is not a CatchPart scope
}

var_resolution_pass_ctx.prototype.create_ctx = function (ast)
{
    return new var_resolution_pass_ctx(this.options, ast);
}

var_resolution_pass_ctx.prototype.walk_statement = function (ast)
{
    if (ast instanceof Program)
    {
        var new_ctx = this.create_ctx(ast);
        ast = ast_walk_statement(ast, new_ctx);

        function set_special(id)
        {
            var v = ast.vars[id];
            if (typeof v !== "undefined")
                v.special = id;
        }

        set_special("eval");
        set_special("arguments");

        return ast;
    }
    else if (ast instanceof CatchPart)
    {
        var new_ctx = this.create_ctx(ast);
        new_ctx.non_catch_scope = this.non_catch_scope;
        return ast_walk_statement(ast, new_ctx);
    }
    else
        return ast_walk_statement(ast, this);
};

var_resolution_pass_ctx.prototype.walk_expr = function (ast)
{
    if (ast instanceof FunctionExpr)
    {
        var new_ctx = this.create_ctx(ast);
        return ast_walk_expr(ast, new_ctx);
    }
    else if (ast instanceof Ref)
    {
        ast.id = resolve_var(this.scope, ast.id);
        return ast;
    }
    else
        return ast_walk_expr(ast, this);
};

function var_resolution_pass(ast, options)
{
    var ctx = new var_resolution_pass_ctx(options, null);
    ctx.walk_statement(ast);
}

//-----------------------------------------------------------------------------

// Renaming pass.
//
// This pass renames the global variables declared in the program so
// that pretty printing will use those names.  A namespace prefix is
// added to all global variables declared by the program, except those
// marked as "exported".

function renaming_pass(ast, options)
{
    if (options.namespace !== false)
    {
        for (id_str in ast.vars)
        {
            var v = ast.vars[id_str];
            if (v.is_declared && !options.exports[id_str])
            {
                var id = v.tok;
                id.value = options.namespace + id.value;
            }
        }
    }
}

//-----------------------------------------------------------------------------

// Profiling pass.
//
// This pass adds profiling code.

function profiling_pass_ctx(options, prog, fn_decl)
{
    this.options = options;
    this.prog = prog;
    this.fn_decl = fn_decl;
}

profiling_pass_ctx.prototype.create_ctx = function (prog, fn_decl)
{
    return new profiling_pass_ctx(this.options, prog, fn_decl);
}

profiling_pass_ctx.prototype.walk_statement = function (ast)
{
    if (ast instanceof Program)
    {
        var new_ctx = this.create_ctx(ast, null);
        return ast_walk_statement(ast, new_ctx);
    }
    else if (ast instanceof FunctionDeclaration)
    {
        var new_ctx = this.create_ctx(this.prog, ast);
        return ast_walk_statement(ast, new_ctx);
    }
    else if (ast instanceof ReturnStatement)
    {
        ast.expr = this.walk_expr(ast.expr);

        if (!this.filter(ast))
        {
            return ast;
        }
        else if (ast.expr !== null)
        {
            ast.expr = this.call_hook(
                           "profile$return1",
                           ast.loc,
                           new Literal(ast.loc, this.options.profile),
                           new Literal(ast.loc, this.options.debug),
                           new Literal(ast.loc, ""),
                           ast.expr);
            return ast;
        }
        else
        {
            return new BlockStatement(ast.loc,
                                      [new ExprStatement(ast.loc,
                                                        this.call_hook(
                                                            "profile$return0",
                                                            ast.loc,
                                                            new Literal(ast.loc, this.options.profile),
                                                            new Literal(ast.loc, this.options.debug),
                                                            new Literal(ast.loc, ""))),
                                       ast]);
        }
    }
    else
        return ast_walk_statement(ast, this);
};

function is_ref(a)
{
    return a instanceof Ref;
}

function is_prop_access(a)
{
    return a instanceof OpExpr && is_prop_access_op(a.op);
}

function is_prop_access_op(op)
{
    return op === "x [ y ]";
}

function is_lvalue(a)
{
    return is_ref(a) || is_prop_access(a);
}

function is_assign_op1(op)
{
    return op === "++ x" ||
           op === "-- x" ||
           op === "x ++" ||
           op === "x --";
}

function is_assign_op2(op)
{
    return op === "x = y" ||
           op === "x += y" ||
           op === "x -= y" ||
           op === "x *= y" ||
           op === "x /= y" ||
           op === "x <<= y" ||
           op === "x >>= y" ||
           op === "x >>>= y" ||
           op === "x &= y" ||
           op === "x ^= y" ||
           op === "x |= y" ||
           op === "x %= y";
}

profiling_pass_ctx.prototype.walk_expr = function (ast)
{
    if (ast instanceof FunctionExpr)
    {
        ast.body = ast_walk_statements(ast.body, this);

        if (this.filter(ast))
        {
            var args_tok = new Token(IDENT_CAT, "arguments", ast.loc);
            var args_var = resolve_var(this.prog, args_tok);
            var fn = ((this.fn_decl !== null)
                      ? this.fn_decl.id.toString()
                      : "")
                     + "(" + ast.params.join() + ")";

            ast.body.unshift(
                new ExprStatement(ast.loc,
                                  this.call_hook(
                                      "profile$enter",
                                      ast.loc,
                                      new Literal(ast.loc, this.options.profile),
                                      new Literal(ast.loc, this.options.debug),
                                      new Literal(ast.loc, fn),
                                      new Ref(ast.loc, args_var))));

            ast.body.push(new ExprStatement(ast.loc,
                                            this.call_hook(
                                                "profile$return0",
                                                ast.loc,
                                                new Literal(ast.loc, this.options.profile),
                                                new Literal(ast.loc, this.options.debug),
                                                new Literal(ast.loc, fn))));
        }

        if (!this.options.profile)
            return ast;

        return ast;///////////////////////// why are we exiting prematurely?

        return this.call_hook("profile$FunctionExpr_hook",
                              ast.loc,
                              ast);
    }
    else if (ast instanceof CallExpr)
    {
        ast.args = ast_walk_exprs(ast.args, this);

        if (ast.fn instanceof Ref &&
            ast.fn.id.special === "eval")
        {
            if (ast.args.length >= 1)
                ast.args[0] = this.call_hook("profile$instrument_hook",
                                             ast.loc,
                                             ast.args[0]);
            return this.call_hook("profile$EvalExpr_hook",
                                  ast.loc,
                                  ast);
        }
        else if (!this.options.profile)
        {
            ast.fn = this.walk_expr(ast.fn);
            return ast;
        }
        else if (false && is_prop_access(ast.fn))
        {
            return this.call_hook.apply(this,
                                        ["profile$call_prop",
                                         ast.loc,
                                         this.walk_expr(ast.fn.exprs[0]),
                                         this.walk_expr(ast.fn.exprs[1])]
                                        .concat(ast.args));
        }
        else
        {
            return ast;///////////////////////////////////
            ast.fn = this.walk_expr(ast.fn);
            return this.call_hook("profile$CallExpr_hook",
                                  ast.loc,
                                  ast);
        }
    }
    else if (!this.options.profile)
    {
        return ast_walk_expr(ast, this);
    }
    else if (ast instanceof OpExpr)
    {
        var op = ast.op;

        if (is_prop_access_op(op)) // handle "a[b]"
        {
            return this.call_hook("profile$get_prop",
                                  ast.loc,
                                  this.walk_expr(ast.exprs[0]),
                                  this.walk_expr(ast.exprs[1]));
        }
        else if (is_assign_op1(op))
        {
            var fn;

                 if (op === "++ x") fn = "_preinc";
            else if (op === "-- x") fn = "_predec";
            else if (op === "x ++") fn = "_postinc";
            else if (op === "x --") fn = "_postdec";
            else error("unknown assignment operator " + op);

            if (is_prop_access(ast.exprs[0])) // handle "a[b] ++"
            {
                return this.call_hook("profile$put_prop" + fn,
                                      ast.loc,
                                      this.walk_expr(ast.exprs[0].exprs[0]),
                                      this.walk_expr(ast.exprs[0].exprs[1]));
            }
            else
            {
                return this.call_hook("profile$set_var" + fn,
                                      ast.loc,
                                      ast);
            }
        }
        else if (is_assign_op2(op))
        {
            var fn;

                 if (op === "x = y")    fn = "";
            else if (op === "x += y")   fn = "_add";
            else if (op === "x -= y")   fn = "_sub";
            else if (op === "x *= y")   fn = "_mul";
            else if (op === "x /= y")   fn = "_div";
            else if (op === "x <<= y")  fn = "_lsh";
            else if (op === "x >>= y")  fn = "_rsh";
            else if (op === "x >>>= y") fn = "_ursh";
            else if (op === "x &= y")   fn = "_and";
            else if (op === "x ^= y")   fn = "_xor";
            else if (op === "x |= y")   fn = "_ior";
            else if (op === "x %= y")   fn = "_mod";
            else error("unknown assignment operator " + op);

            if (is_prop_access(ast.exprs[0])) // handle "a[b] += c"
            {
                return this.call_hook("profile$put_prop" + fn,
                                      ast.loc,
                                      this.walk_expr(ast.exprs[0].exprs[0]),
                                      this.walk_expr(ast.exprs[0].exprs[1]),
                                      this.walk_expr(ast.exprs[1]));
            }
            else
            {
                ast.exprs[1] = this.walk_expr(ast.exprs[1]);
                return this.call_hook("profile$set_var" + fn,
                                      ast.loc,
                                      ast);
            }
        }

        return ast_walk_expr(ast, this);
    }
    else if (ast instanceof NewExpr)
    {
        return this.call_hook("profile$NewExpr_hook",
                              ast.loc,
                              ast_walk_expr(ast, this));
    }
    else if (ast instanceof Literal)
    {
        if (true) // don't profile literals (cause there are so many!)
            return ast_walk_expr(ast, this);
        else
            return this.call_hook("profile$Literal_hook",
                                  ast.loc,
                                  ast_walk_expr(ast, this));
    }
    else if (ast instanceof ArrayLiteral)
    {
        return this.call_hook("profile$ArrayLiteral_hook",
                              ast.loc,
                              ast_walk_expr(ast, this));
    }
    else if (ast instanceof RegExpLiteral)
    {
        return this.call_hook("profile$RegExpLiteral_hook",
                              ast.loc,
                              ast_walk_expr(ast, this));
    }
    else if (ast instanceof ObjectLiteral)
    {
        return this.call_hook("profile$ObjectLiteral_hook",
                              ast.loc,
                              ast_walk_expr(ast, this));
    }
/*
  doesn't work due to "new foo(...)"

    else if (ast instanceof Ref)
    {
        return this.call_hook("profile$Ref_hook",
                              ast.loc,
                              ast_walk_expr(ast, this));
    }
*/
    else if (ast instanceof This)
    {
        return this.call_hook("profile$This_hook",
                              ast.loc,
                              ast_walk_expr(ast, this));
    }
    else
        return ast_walk_expr(ast, this);
};

profiling_pass_ctx.prototype.call_hook = function (fn, loc)
{
    var args = [new Literal(loc,
                            loc.to_string())];

    for (i=2; i<arguments.length; i++)
        args.push(arguments[i]);

    var fn_tok = new Token(IDENT_CAT, fn, loc);
    var fn_var = resolve_var(this.prog, fn_tok);

    return new CallExpr(loc,
                        new Ref(loc, fn_var),
                        args);
};

profiling_pass_ctx.prototype.filter = function (ast)
{
    // TODO: This filtering should be user configurable from a
    // command line option.
    if (ast.loc.filename === "parser/parser.js" ||
        ast.loc.filename === "parser/scanner.js" ||
//        ast.loc.filename === "utility/debug.js" ||
        (this.fn_decl !== null &&
         this.fn_decl.id.toString() === "assert"))
        return false;
    // if (position_to_line(ast.loc.start_pos) == 7 
    //         && position_to_column(ast.loc.start_pos) === 54
    //         && position_to_column(ast.loc.end_pos)) {
    //     return false;
    // }
    return true;
};

function profiling_pass(ast, options)
{
    if (options.debug || options.profile)
    {
        var ctx = new profiling_pass_ctx(options, null, null);
        ctx.walk_statement(ast);
    }
}

//-----------------------------------------------------------------------------

function ast_normalize(ast, options)
{
    if (options === true || options === false || options === undefined) // support old interface
        options = {};

    // Provide default values for unspecified options
    if (!("profile" in options)) options.profile = false;
    if (!("namespace" in options)) options.namespace = false;
    if (!("exports" in options)) options.exports = {};
    if (!("debug" in options)) options.debug = options;
    if (!("warn" in options)) options.warn = false;
    if (!("ast" in options)) options.ast = false;
    if (!("nojs" in options)) options.nojs = false;

    simplification_pass(ast, options);
    var_resolution_pass(ast, options);
    profiling_pass(ast, options);
    renaming_pass(ast, options);

    return ast;
}

//=============================================================================

// Node.js support
if (typeof exports !== "undefined")
{
    exports.ast_normalize = ast_normalize;
}
