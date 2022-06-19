|%
+$  sheet  $:(meta=sheet-meta data=(map address sell))
+$  sheet-meta  $:
  id=@uw
  title=path
  owner=@p
  tags=(set tag)
  row-meta=(map @ud (set row-visual))
  column-meta=(map @ud (set column-visual))
  =whitelist
  last-modified=date
  ==
+$  address  [row-address=@ud column-address=@ud]
+$  tag  @t
+$  sell  [meta=sell-meta data=[input=@t output=@t]]
+$  sell-meta  (set visual)
+$  visual  $%
  [%bold  ?]
  [%italic  ?]
  [%underline  ?]
  [%monospace  ?]
  [%strikethrough  ?]
  [%foreground  tape]
  [%background  tape]
  [%size  @ud]
  [%font  @t]
  ==
+$  row-visual  $%
  [%base visual]
  [%alte height]
+$  column-visual  $?
  [%base visual]
  [%alte width]
+$  height  @ud
+$  width  @ud
+$  whitelist  (map @p access)
+$  access  ?(%read %write)
--